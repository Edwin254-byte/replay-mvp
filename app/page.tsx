import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        {/* Decorative elements */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Interview Platform
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Revolutionize Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Interview Process
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
              Streamline hiring with AI-powered interviews. From candidate screening to detailed analytics, transform
              how you discover top talent with intelligent automation.
            </p>

            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/dashboard/positions">
                  <Users className="w-5 h-5 mr-2" />
                  Manager Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need for modern recruiting
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Our platform combines AI intelligence with intuitive design to make hiring effortless and effective.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-6xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle>AI-Powered Screening</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Intelligent candidate evaluation with natural language processing and automated scoring systems.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <CardTitle>Advanced Analytics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Comprehensive insights and performance metrics to optimize your hiring process and decisions.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <Shield className="h-5 w-5 text-emerald-600" />
                    </div>
                    <CardTitle>Secure & Reliable</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Enterprise-grade security with encrypted data handling and compliant interview processes.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 py-24 sm:py-32">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your hiring?
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Join forward-thinking companies using AI to build better teams. Start your journey today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              <Button asChild size="lg" className="h-12 px-8 text-base bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/dashboard/positions">
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base border-2 border-white bg-white/10 text-white hover:bg-white hover:text-slate-900 transition-colors backdrop-blur-sm"
              >
                <Link href="/public/sample">Try Demo First</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">QuestAI</span>
              </div>
              <p className="text-slate-600 mb-4 max-w-md">
                Revolutionizing the interview process with AI-powered screening and analytics. Make better hiring
                decisions with intelligent automation.
              </p>
              <div className="flex space-x-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/positions">Get Started</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/public/sample">Try Demo</Link>
                </Button>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard/positions" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/analytics" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/public/sample" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 text-sm">© 2025 QuestAI Interview Platform. All rights reserved.</p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors text-sm">
                  Terms of Service
                </a>
                <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors text-sm">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
