import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { supabase } from '../../supabaseDB';
import { NewProject } from '../../components/NewProject';
import { ProjectCard } from '../../components/ProjectCard';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { IconX, IconBell } from "@tabler/icons-react";

const Dashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(UserContext);
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) {
      console.error('No user found in context');
      return;
    }

    const { data: memberships, error: membershipsError } = await supabase
      .from('project_memberships')
      .select('project_id')
      .eq('user_id', user.id);

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError);
      return;
    }

    if (memberships && memberships.length > 0) {
      const projectIds = memberships.map((membership) => membership.project_id);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, description, github_repo_url')
        .in('id', projectIds);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast({
          title: "Error",
          description: "Error fetching projects",
          variant: "destructive",
        });
        return;
      } else {
        setProjects(projectsData);
      }
    } else {
      setProjects([]);
    }
  };

  const fetchInvitations = async () => {
    if (!user) {
      return;
    }

    try {
      const { data: invitations, error } = await supabase
        .from('project_invitations')
        .select(`
          id,
          project_id,
          inviter_id,
          status,
          projects (name),
          inviter:inviter_id (username)
        `)
        .eq('invitee_id', user.id)
        .eq('status', 'Pending');

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }
      setPendingInvitations(invitations || []);
    } catch (err) {
      console.error("Unexpected error fetching invitations:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchInvitations();
    }
  }, [user]);

  const handleAcceptInvite = async (inviteId: string, projectId: string) => {
    const { error } = await supabase
      .from('project_memberships')
      .insert({ project_id: projectId, user_id: user.id });

    if (error) {
      console.error('Error accepting invitation:', error);
      return;
    }

    await supabase
      .from('project_invitations')
      .update({ status: 'Accepted' })
      .eq('id', inviteId);

    fetchProjects();
    fetchInvitations();
  };

  const handleDeclineInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('project_invitations')
      .update({ status: 'Declined' })
      .eq('id', inviteId);

    if (error) {
      console.error('Error declining invitation:', error);
      return;
    }

    fetchInvitations();
  };

  const handleProjectCreated = (project: any) => {
    if (project && project.id) {
      setProjects((prevProjects) => [...prevProjects, project]);
    } else {
      console.error('Invalid project object:', project);
    }
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
  };

  return (
    <div className="flex h-full">
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-64 p-4 bg-[#1e1e1e] border-r border-darkAccent h-full flex flex-col shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-primAccent">Invitations</h2>
            <Button
              onClick={() => setIsSidebarOpen(false)}
              variant="ghost"
              className="p-1 hover:bg-red-600/50 rounded"
            >
              <IconX size={24} className="text-lightAccent" />
            </Button>
          </div>
          {pendingInvitations.length === 0 ? (
            <div className="text-lightAccent/70 text-md text-center">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto">
              {pendingInvitations.map((invite) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 rounded-lg bg-[#2a2a2a] shadow-md hover:shadow-lg transition duration-300"
                >
                  <h3 className="text-lg font-semibold text-lightAccent mb-2">{invite.projects.name}</h3>
                  <p className="text-sm text-lightAccent/80 mb-3">Invited by <span className="text-primAccent font-semibold">{invite.inviter.username}</span></p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => handleAcceptInvite(invite.id, invite.project_id)}
                      className="bg-gradient-to-r from-green-400 to-green-600 px-3 py-1 text-lightAccent rounded-md shadow-md hover:scale-105 transition-transform duration-300 text-sm"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeclineInvite(invite.id)}
                      className="bg-gradient-to-r from-red-400 to-red-600 px-3 py-1 text-lightAccent rounded-md shadow-md hover:scale-105 transition-transform duration-300 text-sm"
                    >
                      Decline
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      {!isSidebarOpen && (
        <motion.button
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-6 right-6 bg-primAccent p-4 rounded-full shadow-lg hover:bg-blue-800 transition duration-300 z-40"
          onClick={() => setIsSidebarOpen(true)}
        >
          <IconBell size={24} className="text-lightAccent" />
        </motion.button>
      )}
      <div className="flex-grow p-4">
        <div className='flex justify-between items-center mb-8'>
          <h1 className="text-4xl font-extrabold text-primAccent">Your Projects</h1>
          <Button
            className="bg-gradient-to-r from-[#0398fc] to-[#00c6ff] px-6 py-3 text-lg font-semibold shadow-lg hover:scale-105 transform transition-transform duration-300"
            onClick={() => setIsModalOpen(true)}
          >
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleProjectDeleted} />
          ))}
        </div>

        <NewProject
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </div>
  );
};

export default Dashboard;
