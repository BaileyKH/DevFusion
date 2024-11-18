import { Link } from 'react-router-dom';

import code from '@/assets/home/home-code.png'

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import DotPattern from '@/components/ui/dot-pattern';
import BoxReveal from "@/components/ui/box-reveal.tsx";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";

export const Home= () => {

  return (
    <main className=''>
      <section className="relative flex gap-x-32 h-screen w-full items-center justify-center overflow-hidden rounded-lg">
          <div className="w-1/2 flex justify-end items-center">
              <div className="h-full w-full max-w-[32rem] items-center justify-center overflow-hidden pt-8 z-10">
                  <BoxReveal boxColor={"#0398fc"} duration={1}>
                      <p className="text-8xl font-semibold text-primAccent">
                      DevFusion
                      </p>
                  </BoxReveal>
              
                  <BoxReveal boxColor={"#0398fc"} duration={1}>
                      <h2 className="mt-4 text-2xl text-lightAccent">
                        Collaborate with your team in real-time and manage your projects with ease.
                      </h2>
                  </BoxReveal>
              
                  <BoxReveal boxColor={"#0398fc"} duration={1}>
                      <div className="mt-[1.5rem]">
                      <p className='text-lightAccent text-lg'>
                          <span className='text-primAccent'>-&gt;</span> Real-Time chat with automatic code detection. <br />
                          <span className='text-primAccent'>-&gt;</span> Individual team member tasks so everyone stays in the loop. <br />
                          <span className='text-primAccent'>-&gt;</span> GitHub integration for seemless collaboration <br />
                      </p>
                      </div>
                  </BoxReveal>
              
                  <BoxReveal boxColor={"#0398fc"} duration={0.5}>
                    <Link to='/auth'>
                      <Button className="mt-12 bg-primAccent py-6 text-lg tracking-wide transition duration-200">Get Started</Button>
                    </Link>
                  </BoxReveal>
              </div>
          </div>
          <div className="w-1/2 flex justify-start items-center">
            <NeonGradientCard neonColors={{ firstColor: '#0398fc', secondColor: '#bbe3fc' }} className="max-w-xl items-center justify-center ">
              <img src={code} className='w-full rounded-lg'/>
            </NeonGradientCard>
          </div>
          <DotPattern
              className={cn(
              "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
              )}
              width={20}
              height={20}
              cx={1}
              cy={1}
              cr={1}
          />
      </section>
    </main>
  );
};