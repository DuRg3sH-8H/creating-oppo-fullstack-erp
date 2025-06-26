"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, School, Users, Shield, Calendar, Award, BookOpen, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { FloatingBackground } from "@/components/ui/floating-background"

export function LandingPage() {
  const [showLoginForm, setShowLoginForm] = useState(false)

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  }

  const features = [
    {
      icon: <School className="h-6 w-6 text-[var(--primary-color)]" />,
      title: "School Management",
      description: "Comprehensive tools for managing school operations, staff, and resources efficiently.",
    },
    {
      icon: <Users className="h-6 w-6 text-[var(--primary-color)]" />,
      title: "User Administration",
      description: "Role-based access control for administrators, teachers, and coordinators.",
    },
    {
      icon: <Calendar className="h-6 w-6 text-[var(--primary-color)]" />,
      title: "Event Calendar",
      description: "Centralized calendar for scheduling and managing school events and activities.",
    },
    {
      icon: <Award className="h-6 w-6 text-[var(--primary-color)]" />,
      title: "Clubs & Activities",
      description: "Tools for creating and managing extracurricular clubs and activities.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-[var(--primary-color)]" />,
      title: "Training Programs",
      description: "Organize and track professional development and training programs.",
    },
    {
      icon: <Shield className="h-6 w-6 text-[var(--primary-color)]" />,
      title: "ISO 21001 Compliance",
      description: "Tools for managing and tracking ISO 21001 certification requirements.",
    },
  ]

  const roles = [
    {
      title: "Super Admin",
      description: "System-wide administration with complete control over schools, users, and settings.",
      image: "/placeholder.svg?height=300&width=400",
      features: ["Manage multiple schools", "Create global clubs", "Oversee ISO compliance", "System configuration"],
      color: "from-indigo-500 to-purple-600",
    },
    {
      title: "School Admin",
      description: "School-specific administration for managing your institution's resources and activities.",
      image: "/placeholder.svg?height=300&width=400",
      features: ["Manage school staff", "Register for clubs", "Track ISO compliance", "School calendar"],
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "ECA Coordinator",
      description: "Specialized tools for managing extracurricular activities and clubs within schools.",
      image: "/placeholder.svg?height=300&width=400",
      features: ["Manage club activities", "Track participation", "Schedule events", "Generate reports"],
      color: "from-emerald-500 to-teal-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9fb] via-[#e6f7fa] to-[#e9f5f7]">
      <FloatingBackground count={8} />

      {/* Navigation */}
      <nav className="relative z-10 backdrop-blur-sm bg-white/70 border-b border-[var(--primary-color)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center">
                <span className="text-white font-bold">SE</span>
              </div>
              <span className="ml-3 text-xl font-bold text-[var(--primary-color)]">School ERP</span>
            </div>
            <div>
              <Button
                onClick={() => setShowLoginForm(true)}
                className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white"
              >
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {showLoginForm ? (
        <div className="py-16 px-4 flex justify-center items-center min-h-[calc(100vh-72px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8 text-center">
              <Button variant="outline" onClick={() => setShowLoginForm(false)} className="mb-4">
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold text-[var(--primary-color)]">Welcome Back</h2>
              <p className="text-gray-600">Log in to access your School ERP dashboard</p>
            </div>
            <LoginForm />
          </motion.div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl sm:text-5xl font-bold text-[var(--primary-color)] leading-tight">
                    Comprehensive School Management System
                  </h1>
                  <p className="mt-4 text-xl text-gray-600">
                    Streamline your educational institution's operations with our all-in-one ERP solution designed for
                    schools.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button
                      onClick={() => setShowLoginForm(true)}
                      className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-6 py-3 text-lg"
                    >
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 px-6 py-3 text-lg"
                    >
                      Learn More
                    </Button>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/dashboard.jpg"
                      alt="School ERP Dashboard"
                      fill
                      className="object-cover"
                    />
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-color)]/30 to-transparent"></div> */}
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-xl p-4 w-48">
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-[var(--primary-color)]" />
                      <span className="ml-2 font-medium">Analytics Dashboard</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-[var(--primary-color)] rounded-full w-3/4"></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-[var(--primary-color)]"
                >
                  Comprehensive Features
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
                >
                  Our School ERP system offers a wide range of features to streamline your educational institution's
                  operations.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-[var(--primary-color)]/10"
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--primary-color)]">{feature.title}</h3>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* User Roles Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-[var(--primary-color)]"
                >
                  Tailored for Different Roles
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
                >
                  Our system provides specialized interfaces and tools for different user roles within your educational
                  ecosystem.
                </motion.p>
              </div>

              <div className="space-y-16">
                {roles.map((role, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                      index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                      <h3 className="text-2xl font-bold text-[var(--primary-color)] mb-4">{role.title}</h3>
                      <p className="text-gray-600 mb-6">{role.description}</p>
                      <ul className="space-y-3">
                        {role.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-[var(--primary-color)] mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                      <div className="relative h-[300px] rounded-xl overflow-hidden shadow-xl">
                        <div className={`absolute inset-0 bg-gradient-to-r ${role.color} opacity-20`}></div>
                        <Image src={role.image || "/placeholder.svg"} alt={role.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="bg-white/90 text-[var(--primary-color)] px-3 py-1 rounded-full text-sm font-medium">
                            {role.title} Dashboard
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--primary-color)]/5 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-[var(--primary-color)]"
                >
                  Why Choose Our School ERP?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
                >
                  Our system is designed to streamline operations, improve communication, and enhance the overall
                  educational experience.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { number: "30%", text: "Reduction in administrative workload" },
                  { number: "50+", text: "Configurable modules and features" },
                  { number: "24/7", text: "Access from anywhere, anytime" },
                  { number: "100%", text: "ISO 21001 compliance support" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-xl p-6 shadow-lg text-center"
                  >
                    <div className="text-3xl font-bold text-[var(--primary-color)]">{stat.number}</div>
                    <div className="mt-2 text-gray-600">{stat.text}</div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="mt-16 text-center"
              >
                <Button
                  onClick={() => setShowLoginForm(true)}
                  className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-8 py-3 text-lg"
                >
                  Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-[var(--primary-color)]"
                >
                  What Our Users Say
                </motion.h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    quote:
                      "The School ERP system has transformed how we manage our administrative tasks. It's intuitive and comprehensive.",
                    name: "Sarah Johnson",
                    role: "School Principal",
                    image: "/placeholder.svg?height=100&width=100",
                  },
                  {
                    quote:
                      "As an ECA coordinator, I can now easily manage all club activities and track student participation efficiently.",
                    name: "Michael Chen",
                    role: "ECA Coordinator",
                    image: "/placeholder.svg?height=100&width=100",
                  },
                  {
                    quote:
                      "The ISO 21001 compliance features have made our certification process much smoother and well-documented.",
                    name: "Priya Sharma",
                    role: "Quality Manager",
                    image: "/placeholder.svg?height=100&width=100",
                  },
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-[var(--primary-color)]/10"
                  >
                    <div className="flex items-center mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--primary-color)]">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] relative">
            <div className="max-w-7xl mx-auto text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl font-bold text-white"
              >
                Ready to Transform Your School Management?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="mt-4 text-xl text-white/90 max-w-3xl mx-auto"
              >
                Join hundreds of educational institutions already using our School ERP system.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <Button
                  onClick={() => setShowLoginForm(true)}
                  className="bg-white text-[var(--primary-color)] hover:bg-white/90 px-8 py-3 text-lg"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/70 backdrop-blur-sm border-t border-[var(--primary-color)]/10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center">
                      <span className="text-white font-bold">SE</span>
                    </div>
                    <span className="ml-3 text-xl font-bold text-[var(--primary-color)]">School ERP</span>
                  </div>
                  <p className="mt-4 text-gray-600">
                    Comprehensive school management system designed for educational institutions of all sizes.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--primary-color)] mb-4">Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>School Management</li>
                    <li>User Administration</li>
                    <li>Event Calendar</li>
                    <li>Clubs & Activities</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--primary-color)] mb-4">Resources</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>Documentation</li>
                    <li>Tutorials</li>
                    <li>Support Center</li>
                    <li>Contact Us</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--primary-color)] mb-4">Legal</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>Privacy Policy</li>
                    <li>Terms of Service</li>
                    <li>Data Protection</li>
                    <li>Compliance</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-[var(--primary-color)]/10 text-center text-gray-600">
                <p>© {new Date().getFullYear()} School ERP System. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
