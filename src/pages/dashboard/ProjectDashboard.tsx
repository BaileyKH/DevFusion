import { useState, useContext } from 'react';
import { UserContext } from '../../App';
import { ProfileModal } from '../../components/ProfileModal';
import { Outlet, NavLink, useParams } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import './projectdash.css'

import { IconX, IconMenu2, IconCaretLeft, IconBrandGithub, IconCheckbox, IconMessageDots, IconSquarePlus, IconUserCircle } from '@tabler/icons-react';

const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const user = useContext(UserContext);

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
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-secDark border-r-2 border-r-primAccent px-6 pb-2 ring-1 ring-white/10">
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
                  <li><NavLink to={`/projects/${projectId}/add`}><div className='project-nav-ico text-xs bg-primAccent hover:bg-red-950 border-none p-2 w-max rounded-md mt-16 transition duration-300'><IconSquarePlus stroke={2} className="h-4 w-4 shrink-0 mr-2"/>Add Members</div></NavLink></li>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </DialogPanel>
      </div>
    </Dialog>

    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-secDark border-r-2 border-r-primAccent px-6">
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
                  <li><NavLink to={`/projects/${projectId}/add`}><div className='project-nav-ico text-xs bg-primAccent hover:bg-red-950 border-none p-2 w-max rounded-md mt-16 transition duration-300'><IconSquarePlus stroke={2} className="h-4 w-4 shrink-0 mr-2"/>Add Members</div></NavLink></li>
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
                    <IconUserCircle
                      size={28}
                      className="text-lightAccent cursor-pointer"
                      onClick={() => setIsUserModalOpen(true)}
                    />
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


