"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useRef,
  useState,
  useEffect,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import ContactForm from "../components/ContactForm";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface ContactForm {
  name: string;
  email: string;
  phone_number: string;
  message: string;
}

interface Project {
  id: number;
  name: string;
  cover_image: string;
  subcategory: string;
  featured: boolean;
}

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  const servicesRef = useRef(null);
  const projectsRef = useRef(null);
  const aboutRef = useRef(null);

  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    phone_number: "",
    message: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("featured", true)
          .limit(3);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Raw Supabase data:", data);

        if (data) {
          data.forEach((project) => {
            console.log("Project image URL:", project.cover_image);
          });
          setFeaturedProjects(data);
        }
      } catch (error) {
        console.error("Error fetching featured projects:", error);
      }
    };

    fetchFeaturedProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const { error: insertError } = await supabase.from("contacts").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        message: formData.message.trim(),
      });

      if (insertError) {
        console.error("Supabase error:", insertError);
        throw insertError;
      }

      // Clear form and show success message
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        message: "",
      });
      setSuccess(true);

      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push("/projects");
      }, 1500);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  return (
    <div className="bg-[#1A1F2E] min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="Modern Luxury Architecture"
            fill
            className="object-cover"
            priority
            quality={100}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1F2E]/95 via-[#1A1F2E]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-7xl font-light text-white mb-6 leading-tight"
            >
              ELEVATING
              <br />
              <span className="text-[#DBA463]">ARCHITECTURE</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-white/80 mb-12 leading-relaxed max-w-2xl"
            >
              Creating timeless spaces that blend innovative design with
              functional excellence. We transform visions into architectural
              masterpieces.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-3 border border-[#DBA463] text-[#DBA463] hover:bg-[#DBA463] hover:text-white transition-all duration-300 group"
              >
                EXPLORE OUR WORK
                <motion.svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </motion.svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <motion.div {...fadeIn} className="space-y-6">
              <h2 className="text-4xl font-light text-[#1A1F2E]">
                INNOVATIVE
                <br />
                <span className="text-[#DBA463]">DESIGN APPROACH</span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                With over a decade of experience in architectural excellence, we
                bring your vision to life through innovative design and
                meticulous attention to detail.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-3xl font-light text-[#DBA463] mb-2">
                    150+
                  </h3>
                  <p className="text-gray-600">Projects Completed</p>
                </div>
                <div>
                  <h3 className="text-3xl font-light text-[#DBA463] mb-2">
                    12+
                  </h3>
                  <p className="text-gray-600">Years Experience</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              {...fadeIn}
              className="relative h-[500px] bg-gray-100 rounded-lg overflow-hidden"
            >
              <Image
                src="/house.jpeg"
                alt="Innovative Architecture Design"
                fill
                className="object-cover rounded-lg transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="relative py-24 bg-[#1A1F2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              {...fadeIn}
              className="text-4xl font-light text-white mb-4"
            >
              OUR <span className="text-[#DBA463]">SERVICES</span>
            </motion.h2>
            <motion.p {...fadeIn} className="text-white/80 max-w-2xl mx-auto">
              Comprehensive architectural solutions tailored to your needs
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Architectural Design",
                description:
                  "Creating innovative and functional spaces that inspire.",
                icon: "🏛️",
              },
              {
                title: "Interior Planning",
                description:
                  "Crafting beautiful and practical interior spaces.",
                icon: "🎨",
              },
              {
                title: "Construction Service",
                description: "Expert construction management and execution.",
                icon: "🏗️",
              },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-light text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-white/70">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12">
            <span className="text-3xl font-bold text-white">FEATURED </span>
            <span className="text-3xl font-bold text-[#DBA463]">PROJECTS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div key={project.id} className="relative group">
                <Link href={`/projects/${project.id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.cover_image}
                      alt={project.name || ""}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                      className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-white font-semibold">
                        {project.name}
                      </h3>
                      <p className="text-gray-200 text-sm">
                        {project.subcategory}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/projects"
              className="inline-block px-6 py-2 border border-[#DBA463] text-[#DBA463] hover:bg-[#DBA463] hover:text-white transition-colors duration-300"
            >
              VIEW ALL PROJECTS →
            </Link>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Get in Touch
          </h2>
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone_number"
                  className="block text-gray-300 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
                  placeholder="+254 XXX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {success && (
                <p className="text-green-500 text-sm">
                  Message sent successfully!
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C6A87D] text-white py-3 px-6 rounded-lg hover:bg-[#B89A6F] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#1A1F2E] text-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-light mb-4">
                KIMTHE<span className="text-[#DBA463]">ARCHITECT</span>
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Creating innovative architectural solutions that inspire and
                transform spaces into extraordinary experiences.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-light mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-white/60 hover:text-[#DBA463] transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/projects"
                    className="text-white/60 hover:text-[#DBA463] transition-colors"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-white/60 hover:text-[#DBA463] transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white/60 hover:text-[#DBA463] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-light mb-4">Contact Info</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-white/60">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  kimthearchitect0@gmail.com
                </li>
                <li className="flex items-center text-white/60">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +254 196 98588
                </li>

                {/* Social Media */}
                <li className="pt-4">
                  <a
                    href="https://www.instagram.com/kim_thearchitect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-white/60 hover:text-[#DBA463] transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Follow us on Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/60">
            <p>
              © {new Date().getFullYear()} Kimthearchitect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
