import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { ProfileModal } from '../../components/ProfileModal';
import { Outlet, NavLink, useParams } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react';
import { supabase } from '../../supabaseDB';
import './projectdash.css';

import {
  IconX,
  IconMenu2,
  IconCaretLeft,
  IconBrandGithub,
  IconCheckbox,
  IconMessageDots,
  IconSquarePlus,
  IconTrash,
  IconUsers
} from '@tabler/icons-react';

const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [projectOwnerId, setProjectOwnerId] = useState<string | null>(null);
  const { user } = useContext(UserContext);

  // Fetch project members
  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        // Fetch project owner
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('owner_id')
          .eq('id', projectId)
          .single();

        if (projectError) {
          console.error('Error fetching project owner:', projectError);
          return;
        }

        if (projectData) {
          setProjectOwnerId(projectData.owner_id);
        }

        // Fetch project members
        const { data: membersData, error: membersError } = await supabase
          .from('project_memberships')
          .select(`
            user_id,
            users: user_id (
              username,
              avatar_url
            )
          `)
          .eq('project_id', projectId);

        if (membersError) {
          console.error('Error fetching project members:', membersError);
          return;
        }

        if (membersData) {
          setMembers(membersData);
        }
      } catch (error) {
        console.error('Unexpected error fetching project members:', error);
      }
    };

    fetchProjectMembers();
  }, [projectId]);

  // Handles removing a member
  const handleRemoveMember = async (memberId: string) => {
    if (!user || user.id !== projectOwnerId) {
      alert('You do not have permission to remove members.');
      return;
    }

    const confirmRemove = window.confirm('Are you sure you want to remove this member?');
    if (!confirmRemove) return;

    try {
      const { error } = await supabase
        .from('project_memberships')
        .delete()
        .eq('user_id', memberId)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error removing member:', error);
        alert('Error removing member. Please try again.');
      } else {
        setMembers((prevMembers) => prevMembers.filter((member) => member.user_id !== memberId));
        alert('Member removed successfully.');
      }
    } catch (error) {
      console.error('Unexpected error removing member:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className='h-full'>
    <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-primAccent transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex">
        <DialogPanel
          transition
          className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
        >
          <TransitionChild>
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
              <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                <span className="sr-only">Close sidebar</span>
                <IconX stroke={2} aria-hidden="true" className="h-6 w-6 text-white" />
              </button>
            </div>
          </TransitionChild>
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primDark border-r-2 border-r-primAccent px-6 pb-2 ring-1 ring-white/10">
            <div className="flex h-16 shrink-0 items-center">
              <h2>DevFusion</h2>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                <ul role="list" className="mx-3 space-y-6">
                  <li><NavLink to={`/dashboard`}><div className='project-nav-ico underline underline-offset-4 mb-16'><IconCaretLeft stroke={2} className="h-6 w-6 shrink-0"/>Dashboard</div></NavLink></li>
                  <li><NavLink to={`/projects/${projectId}`} end><div className='project-nav-ico'><IconMessageDots stroke={2} className="h-6 w-6 shrink-0 mr-2"/>Chat</div></NavLink></li>
                  <li><NavLink to={`/projects/${projectId}/tasks`}><div className='project-nav-ico'><IconCheckbox stroke={2} className="h-6 w-6 shrink-0 mr-2"/>Tasks</div></NavLink></li>
                  <li><NavLink to={`/projects/${projectId}/changelog`}><div className='project-nav-ico'><IconBrandGithub stroke={2} className="h-6 w-6 shrink-0 mr-2"/>Change Logs</div></NavLink></li>
                  <div>
                    <div className="h-full overflow-hidden px-4 sm:px-6 lg:px-8">
                      <div className='flex'>
                        <IconUsers stroke={2} className="h-6 w-6 shrink-0 mr-2"/>
                        <h3 className="text-sm font-semibold tracking-wider">Project Members</h3>
                      </div>
                      <ul className="space-y-4">
                        {members.map((member) => (
                          <li key={member.user_id} className="flex items-center gap-x-4">
                            {member.users.avatar_url ? (
                              <img
                                src={member.users.avatar_url}
                                alt="Avatar"
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                                {member.users.username[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium">{member.users.username}</span>
                            {user?.id === projectOwnerId && member.user_id !== projectOwnerId && (
                              <button
                                onClick={() => handleRemoveMember(member.user_id)}
                                className="ml-auto p-2 text-primAccent hover:text-red-500 transition duration-300"
                              >
                                <IconTrash size={18} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      {user?.id === projectOwnerId && (
                        <li><NavLink to={`/projects/${projectId}/add`}><div className='project-nav-ico text-xs bg-primAccent hover:bg-blue-800 border-none p-2 w-max rounded-md transition duration-300'><IconSquarePlus stroke={2} className="h-4 w-4 shrink-0 mr-2"/>Add Members</div></NavLink></li>
                      )}
                    </div>
                  </div>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </DialogPanel>
      </div>
    </Dialog>

    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primDark border-r border-r-primAccent px-6">
        <div className="flex h-16 shrink-0 items-center">
          <h2 className='font-bold text-2xl tracking-wider'>DevFusion</h2>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="mx-3 space-y-8">
                  <li><NavLink to={`/dashboard`}><div className='project-nav-ico underline underline-offset-4 mb-16'><IconCaretLeft stroke={2} className="h-6 w-6 shrink-0"/>Dashboard</div></NavLink></li>
                  <li><NavLink to={`/projects/${projectId}`} end><div className='project-nav-ico'><IconMessageDots stroke={2} className="h-6 w-6 shrink-0 mr-2"/>Chat</div></NavLink></li>
                  <li><NavLink to={`/projects/${projectId}/tasks`}><div className='project-nav-ico'><IconCheckbox stroke={2} className="h-6 w-6 shrink-0 mr-2"/>Tasks</div></NavLink></li>
                  <li><NavLink to={`/projects/${projectId}/changelog`}><div className='project-nav-ico'><IconBrandGithub stroke={2} className="h-6 w-6 shrink-0 mr-2"/>Change Logs</div></NavLink></li>
                  <div>
                    <div className="h-full overflow-hidden mt-16 mb-12">
                      <div className='flex items-center mb-4 nav-gradient pb-2'>
                        <IconUsers stroke={2} className="h-6 w-6 shrink-0 mr-2"/>
                        <h3 className="text-sm font-semibold tracking-wider">Project Members</h3>
                      </div>
                      <ul className="space-y-4">
                        {members.map((member) => (
                          <li key={member.user_id} className="flex items-center gap-x-4">
                            {member.users.avatar_url ? (
                              <img
                                src={member.users.avatar_url}
                                alt="Avatar"
                                className="h-6 w-6 rounded-full"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-lg text-primAccent">
                                {member.users.username[0].toUpperCase()}
                              </div>
                            )}
                            <p className="font-medium text-lightAccent text-sm">{member.users.username}</p>
                            {user?.id === projectOwnerId && member.user_id !== projectOwnerId && (
                              <button
                                onClick={() => handleRemoveMember(member.user_id)}
                                className="ml-auto p-2 text-primAccent hover:text-red-500 transition duration-200"
                              >
                                <IconTrash size={18} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      {user?.id === projectOwnerId && (
                        <li><NavLink to={`/projects/${projectId}/add`}><div className='project-nav-ico text-xs bg-primAccent hover:bg-blue-800 border-none p-2 w-max rounded-md transition duration-300'><IconSquarePlus stroke={2} className="h-4 w-4 shrink-0 mr-2"/>Add Members</div></NavLink></li>
                      )}
                    </div>
                  </div>
              </ul>
            </li>
            <li className="-mx-6 mt-auto">
              <div className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-lightAccent">
                {user && user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="User Avatar"
                      className="h-10 w-10 rounded-full cursor-pointer border border-darkAccent"
                      onClick={() => setIsUserModalOpen(true)}
                    />
                  ) : (
                    <div onClick={() => setIsUserModalOpen(true)} className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg text-primAccent">
                      {user.username[0].toUpperCase()}
                    </div>
                )}
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true" className='text-lightAccent'>{user.username}</span>
                </div>
            </li>
            {isUserModalOpen && (
              <ProfileModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
            )}
          </ul>
        </nav>
      </div>
    </div> 

    <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
      <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
        <span className="sr-only">Open sidebar</span>
        <IconMenu2 aria-hidden="true" className="h-6 w-6" />
      </button>
      <div className="flex-1 text-sm/6 font-semibold text-white">Dashboard</div>
        <span className="sr-only">Your profile</span>
        <img
          src={user.avatar_url}
          alt="User Avatar"
          className="h-8 w-8 rounded-full"
          onClick={() => setIsUserModalOpen(true)}
        />
        {isUserModalOpen && (
          <ProfileModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
        )}
    </div>

    <main className="flex-grow overflow-hidden lg:pl-72">
      <div className="h-full overflow-hidden px-4 sm:px-6 lg:px-8"><Outlet /></div>
    </main>
  </div>
  );
};

export default ProjectDashboard;


