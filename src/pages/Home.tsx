import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import code from "@/assets/home/home-code.png";
import { cn } from "@/lib/utils";
import {
    IconCheckbox,
    IconUsers,
    IconBrandGithub,
    IconCheck,
    IconArrowRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import BoxReveal from "@/components/ui/box-reveal.tsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const Home = () => {
    const date = new Date().getFullYear();

    const cardsData = [
        {
            title: "Real-Time Collaboration",
            description:
                "Chat in real-time with automatic code detection, ensuring seamless team communication and a streamlined workflow.",
            features: [
                "Instant messaging",
                "Automatic and Manual code detection",
                "File sharing",
            ],
            icon: <IconUsers />,
            gradient: "from-[#0398fc] to-[#00c6ff]",
        },
        {
            title: "Task Management",
            description:
                "Assign tasks to your team, set priorities, and track progress. Keep everyone aligned and focused on delivering results.",
            features: [
                "Create and assign tasks effortlessly",
                "Track task progress visually",
                "Notifications for task updates",
            ],
            icon: <IconCheckbox />,
            gradient: "from-[#0398fc] to-[#bbe3fc]",
        },
        {
            title: "GitHub Integration",
            description:
                "Keep your repositories connected to easily manage pull requests, commits, and collaborate directly from DevFusion.",
            features: [
                "View and track commits directly in the project dashboard",
                "Synchronize project discussions with repository changes",
                "Streamlined access to pull requests and code changes",
            ],
            icon: <IconBrandGithub />,
            gradient: "from-[#0398fc] to-[#66e0ff]",
        },
    ];

    return (
        <main className="">
            <section className="relative flex flex-col md:flex-row h-auto md:h-screen w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#121212] to-[#0d0d0d] text-lightAccent gap-y-8 md:gap-x-14 p-6 md:p-0">
                {/* Text Section */}
                <div className="w-full md:w-1/2 flex justify-end items-center mb-8 md:mb-0">
                    <div className="h-full w-full max-w-[36rem] items-center justify-center overflow-hidden pt-8 md:pt-0 z-10">
                        <BoxReveal boxColor={"#0398fc"} duration={1}>
                            <motion.p
                                className="text-5xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0398fc] to-[#00c6ff] neon-shadow"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                DevFusion
                            </motion.p>
                        </BoxReveal>
                        <BoxReveal boxColor={"#0398fc"} duration={1}>
                            <motion.h2
                                className="mt-4 md:mt-6 text-xl md:text-2xl text-lightAccent/90 tracking-wider leading-tight"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1, duration: 1 }}
                            >
                                Empowering seamless teamwork and effortless
                                project management.
                            </motion.h2>
                        </BoxReveal>
                        <BoxReveal boxColor={"#0398fc"} duration={1}>
                            <motion.div
                                className="mt-8 md:mt-12 space-y-4 text-lightAccent text-md md:text-lg leading-relaxed tracking-wide"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5, duration: 1 }}
                            >
                                <div className="flex items-center justify-start gap-2">
                                    <span className="text-primAccent">
                                        <IconArrowRight />
                                    </span>
                                    Real-time chat with smart code detection.
                                </div>
                                <div className="flex items-center justify-start gap-2">
                                    <span className="text-primAccent">
                                        <IconArrowRight />
                                    </span>
                                    Transparent task management for easy
                                    tracking.
                                </div>
                                <div className="flex items-center justify-start gap-2">
                                    <span className="text-primAccent">
                                        <IconArrowRight />
                                    </span>
                                    Integrated GitHub collaboration.
                                </div>
                            </motion.div>
                        </BoxReveal>
                        <BoxReveal boxColor={"#0398fc"} duration={0.5}>
                            <Link to="/auth">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 2, duration: 0.5 }}
                                >
                                    <Button className="mt-8 md:mt-12 py-4 md:py-6 px-8 md:px-12 bg-gradient-to-r from-[#0398fc] to-[#00c6ff] text-md md:text-lg tracking-wider shadow-lg transform hover:shadow-primAccent hover:bg-gradient-to-r hover:from-[#00c6ff] hover:to-[#0398fc] transition-all duration-300">
                                        Get Started
                                    </Button>
                                </motion.div>
                            </Link>
                        </BoxReveal>
                    </div>
                </div>

                {/* Image Section */}
                <div className="w-full md:w-1/2 flex justify-center md:justify-start items-center relative">
                    <motion.div
                        className="absolute -top-16 -left-16 md:-top-32 md:-left-24 h-[200px] w-[200px] md:h-[300px] md:w-[300px] rounded-full bg-gradient-to-br from-[#00c6ff] to-[#0398fc] blur-2xl md:blur-3xl opacity-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.img
                        src={code}
                        className="max-w-[90%] md:max-w-[700px] rounded-lg shadow-2xl z-10"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute -bottom-10 right-[-50px] md:bottom-[-50px] md:right-[-100px] h-[150px] w-[150px] md:h-[250px] md:w-[250px] rounded-full bg-gradient-to-tr from-[#00c6ff] to-[#00e4ff] blur-2xl md:blur-3xl opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ duration: 1.5, delay: 1 }}
                    />
                    <motion.div
                        className="absolute -bottom-10 left-10 md:-bottom-20 md:left-20 h-[100px] w-[100px] md:h-[150px] md:w-[150px] rounded-full bg-gradient-to-br from-[#00e4ff] to-[#0398fc] blur-xl md:blur-2xl opacity-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ duration: 1.5, delay: 1.5 }}
                    />
                </div>
            </section>
            <section className="relative py-20 px-4 md:px-12 lg:px-32 overflow-hidden bg-[#121212]">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-lightAccent">
                        Why DevFusion?
                    </h2>
                    <p className="text-lg mt-4 text-lightAccent/85">
                        Discover why DevFusion stands out in the world of
                        development collaboration.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
                    {cardsData.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ rotateY: -10, rotateX: 5, opacity: 0.8 }}
                            whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                            className={cn(
                                "relative group overflow-hidden rounded-3xl transition duration-300",
                                "hover:shadow-[0px_20px_50px_rgba(0,0,0,0.5)] hover:shadow-primAccent/50"
                            )}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-70 z-0 transition-all duration-500`}
                            ></div>
                            <Card className="relative p-8 overflow-hidden rounded-3xl z-10 bg-gradient-to-b from-[#121212]/90 via-[#121212]/60 to-[#0d0d0d]/50 border border-primAccent/30 shadow-lg shadow-[#0398fc]/20 h-full">
                                <CardHeader>
                                    <motion.div
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay: 0.1 * index,
                                            duration: 0.6,
                                        }}
                                        className="text-primAccent mb-6 text-5xl"
                                    >
                                        {card.icon}
                                    </motion.div>
                                    <CardTitle className="text-3xl font-semibold text-lightAccent">
                                        {card.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="mt-4">
                                    <p className="text-lightAccent/85">
                                        {card.description}
                                    </p>
                                    <ul className="mt-4 text-lightAccent/70 space-y-3">
                                        {card.features.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center"
                                            >
                                                <span className="text-primAccent mr-3">
                                                    <IconCheck size={20} />
                                                </span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>
            <section className="w-full py-20 relative bg-[url('/prod-bg.svg')] bg-center bg-cover bg-no-repeat text-center text-darkAccent overflow-hidden">
                <motion.div
                    className="absolute inset-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />

                <div className="relative max-w-5xl mx-auto px-8">
                    <motion.h2
                        className="text-5xl font-semibold mb-6 text-lightAccent"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        Ready to Boost Your Team's Productivity?
                    </motion.h2>

                    <motion.p
                        className="text-xl mb-10 text-lightAccent/95"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        DevFusion provides the best tools to foster
                        collaboration, streamline project management, and
                        improve your team's efficiency. See how we can transform
                        your workflow.
                    </motion.p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-16 text-left">
                        <motion.div
                            className="p-6 bg-[#121212] rounded-lg shadow-md border border-lightAccent/10 hover:shadow-lg transition-transform transform hover:-translate-y-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 1 }}
                        >
                            <div className="flex items-center mb-4">
                                <IconCheck className="text-primAccent mr-2" />
                                <h3 className="text-xl font-semibold text-lightAccent">
                                    Efficient Task Management
                                </h3>
                            </div>
                            <p className="text-lightAccent/75">
                                Assign, manage, and track tasks effortlessly,
                                ensuring everyone in your team stays aligned
                                with the project's goals.
                            </p>
                        </motion.div>

                        <motion.div
                            className="p-6 bg-[#121212] rounded-lg shadow-md border border-lightAccent/10 hover:shadow-lg transition-transform transform hover:-translate-y-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 1 }}
                        >
                            <div className="flex items-center mb-4">
                                <IconCheck className="text-primAccent mr-2" />
                                <h3 className="text-xl font-semibold text-lightAccent">
                                    Seamless Communication
                                </h3>
                            </div>
                            <p className="text-lightAccent/75">
                                Real-time chat and discussions with automatic
                                code detection to keep communication effective
                                and organized.
                            </p>
                        </motion.div>

                        <motion.div
                            className="p-6 bg-[#121212] rounded-lg shadow-md border border-lightAccent/10 hover:shadow-lg transition-transform transform hover:-translate-y-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 1 }}
                        >
                            <div className="flex items-center mb-4">
                                <IconCheck className="text-primAccent mr-2" />
                                <h3 className="text-xl font-semibold text-lightAccent">
                                    GitHub Integration
                                </h3>
                            </div>
                            <p className="text-lightAccent/75">
                                Integrate with GitHub to connect your
                                repositories and streamline pull requests,
                                commits, and project updates.
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.6 }}
                    >
                        <Link to="/auth">
                            <Button
                                size="lg"
                                className="text-lg bg-primDark text-lightAccent transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Get Started Now
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
            <footer className="bg-primDark text-center py-2">
                <p className="text-xs text-primAccent">
                    &copy; {date} BaileyKH. All rights reserved.
                </p>
            </footer>
        </main>
    );
};
