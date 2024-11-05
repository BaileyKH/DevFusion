import { useState } from 'react';
import { Outlet, NavLink, useParams } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import './projectdash.css'

import { IconX, IconMenu2, IconCaretLeft, IconBrandGithub, IconCheckbox, IconMessageDots, IconSquarePlus } from '@tabler/icons-react';

export const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='h-full'>
    <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-secAccent transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
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
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primDark px-6 pb-2 ring-1 ring-white/10">
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
                  <li><NavLink to={`/projects/${projectId}/add`}><div className='project-nav-ico bg-primAccent border-none p-2 w-max rounded-md mt-16'><IconSquarePlus stroke={2} className="h-6 w-6 shrink-0 mr-2"/>Add Members</div></NavLink></li>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </DialogPanel>
      </div>
    </Dialog>

    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primDark px-6">
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
                  <li><NavLink to={`/projects/${projectId}/add`}><div className='project-nav-ico bg-primAccent border-none p-2 w-max rounded-md mt-16'><IconSquarePlus stroke={2} className="h-6 w-6 shrink-0 mr-2"/>Add Members</div></NavLink></li>
              </ul>
            </li>
            <li className="-mx-6 mt-auto">
              <a
                href="#"
                className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white"
              >
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="h-8 w-8 rounded-full bg-primDark"
                />
                <span className="sr-only">Your profile</span>
                <span aria-hidden="true">Test</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div> 

    <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-primDark px-4 py-4 shadow-sm sm:px-6 lg:hidden">
      <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
        <span className="sr-only">Open sidebar</span>
        <IconMenu2 stroke={2} aria-hidden="true" className="h-6 w-6" />
      </button>
      <div className="flex-1 text-sm/6 font-semibold text-white">Dashboard</div>
      <a href="#">
        <span className="sr-only">Your profile</span>
        <img
          alt=""
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          className="h-8 w-8 rounded-full bg-primDark"
        />
      </a>
    </div>

    <main className="py-6 lg:pl-72">
      <div className="px-4 sm:px-6 lg:px-8"><Outlet /></div>
    </main>
  </div>
  );
};




