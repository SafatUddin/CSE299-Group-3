import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Users, CheckSquare, TrendingUp, UserPlus, Calendar, ArrowRight } from "lucide-react";
import workspaceImage from "./workspace.png";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ProjectFlow" },
    { name: "description", content: "Welcome to ProjectFlow!" },
  ];
}

const Homepage = () => {
    const scrollToFeatures = () => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full min-h-screen bg-white">
            {/* Navigation */}
            <nav className="w-full px-6 md:px-20 py-5 flex items-center justify-between border-b border-gray-200 bg-white">
                <div className="text-xl font-semibold text-black">
                    ProjectFlow
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/sign-in">
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Log in
                        </Button>
                    </Link>
                    <Link to="/sign-up">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="w-full px-6 md:px-20 py-16 md:py-24">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
                            Get more done with <span className="text-blue-600">ProjectFlow</span>
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            The modern task management platform that helps teams organize, track, and complete work efficiently.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link to="/sign-up">
                                <Button 
                                    size="lg" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-6 text-base"
                                >
                                    Get started
                                </Button>
                            </Link>
                            <Button 
                                size="lg" 
                                variant="outline" 
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-8 py-6 text-base"
                                onClick={scrollToFeatures}
                            >
                                See features
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-6 pt-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                                <span>No subscription required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                                <span>Completely free to use</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                                <span>Easy to customize</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Dashboard Mockup */}
                    <div className="relative">
                        <img 
                            src={workspaceImage} 
                            alt="Dashboard Preview" 
                            className="rounded-2xl shadow-2xl w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="w-full px-6 md:px-20 py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-6">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Our Features</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
                            Everything you need to manage tasks effectively
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Our powerful features help teams stay organized and deliver projects on time
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mt-16">
                        {/* Feature 1 */}
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black">
                                Team Collaboration
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Work together seamlessly with real-time updates, comments, and notifications to keep everyone in sync.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                                <CheckSquare className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black">
                                Task Management
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Organize tasks with priorities, due dates, and labels to ensure your team completes projects visually.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black">
                                Progress Tracking
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Monitor project progress with intuitive dashboards and reports to measure your team productivity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="w-full px-6 md:px-20 py-20 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-6">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">How It Works</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
                            Simple process, powerful results
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Get started in minutes and see improved team productivity
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start justify-center gap-4 mt-16 max-w-6xl mx-auto">
                        {/* Step 1 */}
                        <div className="text-center space-y-3 flex-1">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <UserPlus className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-base font-bold text-black">
                                Create an account
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Sign up for free and set up your first workspace in seconds.
                            </p>
                        </div>

                        {/* Dotted Arrow 1 */}
                        <div className="hidden md:flex items-center flex-shrink-0 mt-5 px-2">
                            <div className="flex items-center">
                                <div className="border-t-2 border-dotted border-blue-400 w-16"></div>
                                <ArrowRight className="h-5 w-5 text-blue-600 -ml-1" strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center space-y-3 flex-1">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-base font-bold text-black">
                                Invite your team
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Add your teammates and start collaborating immediately.
                            </p>
                        </div>

                        {/* Dotted Arrow 2 */}
                        <div className="hidden md:flex items-center flex-shrink-0 mt-5 px-2">
                            <div className="flex items-center">
                                <div className="border-t-2 border-dotted border-blue-400 w-16"></div>
                                <ArrowRight className="h-5 w-5 text-blue-600 -ml-1" strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center space-y-3 flex-1">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-base font-bold text-black">
                                Get things done
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Useboards, assign tasks, and track progress to boost productivity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full px-6 md:px-20 py-20 bg-blue-600">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                        Ready to boost your team's productivity?
                    </h2>
                    <p className="text-lg md:text-xl text-blue-100">
                        Get started in minutes and see improved team productivity
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center pt-4">
                        <Link to="/sign-up">
                            <Button 
                                size="lg" 
                                className="bg-white text-blue-600 hover:bg-gray-100 rounded-md px-8 py-6 text-base font-semibold"
                            >
                                Get started
                            </Button>
                        </Link>
                        <Link to="/sign-in">
                            <Button 
                                size="lg" 
                                variant="outline" 
                                className="border-2 border-white text-blue-600 bg-white hover:bg-blue-50 hover:border-blue-50 hover:text-blue-600 rounded-md px-8 py-6 text-base font-semibold"
                            >
                                Sign in
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full px-6 md:px-20 py-12 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <div className="text-xl font-semibold text-black mb-2">ProjectFlow</div>
                            <p className="text-sm text-gray-600">Simplify task management and team collaboration.</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-600 hover:text-black">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-600 hover:text-black">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-600 hover:text-black">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-600">&copy; 2025 ProjectFlow. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;