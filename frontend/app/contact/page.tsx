"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronRight, Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-cream">

      {/* Breadcrumb */}
      <div className="bg-beige-100 border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 font-sans text-xs text-charcoal-400">
            <Link href="/" className="hover:text-terracotta-600 transition-colors duration-200">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-charcoal-700 font-medium">Contact</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-beige-200 py-12 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600 mb-3">Get In Touch</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-charcoal-900 leading-tight">
            We&apos;d Love to Hear<br />From You
          </h1>
          <p className="font-sans text-base text-charcoal-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Have a question about a product, want a custom piece, or just want to say hello? Drop us a message — we reply within 24 hours.
          </p>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Left — Info */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="font-serif text-2xl text-charcoal-900 mb-2">Contact Details</h2>
            <p className="font-sans text-sm text-charcoal-500 leading-relaxed">
              Our studio team is available Monday through Saturday, 10am &ndash; 7pm (BST).
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Mail */}
            <div className="flex items-start gap-4 bg-white border border-beige-200 rounded-2xl p-5 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10 text-terracotta-600">
                <Mail className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">Email</p>
                <p className="font-sans text-sm font-medium text-charcoal-900">hello@glideearth.com</p>
                <p className="font-sans text-xs text-charcoal-400">For orders &amp; product queries</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 bg-white border border-beige-200 rounded-2xl p-5 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10 text-terracotta-600">
                <Phone className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">Phone</p>
                <p className="font-sans text-sm font-medium text-charcoal-900">+880 1700-000000</p>
                <p className="font-sans text-xs text-charcoal-400">WhatsApp &amp; voice calls</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4 bg-white border border-beige-200 rounded-2xl p-5 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10 text-terracotta-600">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">Studio Address</p>
                <p className="font-sans text-sm font-medium text-charcoal-900">12 Artisan Lane, Dhanmondi</p>
                <p className="font-sans text-xs text-charcoal-400">Dhaka, Bangladesh 1205</p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4 bg-white border border-beige-200 rounded-2xl p-5 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10 text-terracotta-600">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">Studio Hours</p>
                <p className="font-sans text-sm font-medium text-charcoal-900">Mon &ndash; Sat, 10am &ndash; 7pm</p>
                <p className="font-sans text-xs text-charcoal-400">Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Quote card */}
          <div className="bg-terracotta-50 border border-terracotta-200 rounded-2xl p-6">
            <p className="font-serif text-sm text-terracotta-700 leading-relaxed italic">
              &ldquo;Every message we receive is read personally by our team. We don&apos;t do auto-replies &mdash; real people, real answers.&rdquo;
            </p>
            <p className="mt-3 font-sans text-xs text-terracotta-600 font-semibold">&mdash; The Glideearth Studio Team</p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="bg-white border border-beige-200 rounded-2xl shadow-card p-8">
          <h2 className="font-serif text-2xl text-charcoal-900 mb-6">Send a Message</h2>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-500/10">
                <CheckCircle className="h-8 w-8 text-terracotta-600" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl text-charcoal-900">Message Sent!</h3>
              <p className="font-sans text-sm text-charcoal-500 max-w-xs leading-relaxed">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 font-sans text-sm font-medium text-terracotta-600 hover:text-terracotta-700 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fatima Rahman"
                    className="bg-beige-50 border border-beige-200 rounded-sm px-4 py-3 font-sans text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400/20 transition-colors w-full"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-beige-50 border border-beige-200 rounded-sm px-4 py-3 font-sans text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400/20 transition-colors w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Custom engraved lighter order"
                  className="bg-beige-50 border border-beige-200 rounded-sm px-4 py-3 font-sans text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400/20 transition-colors w-full"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you need..."
                  className="bg-beige-50 border border-beige-200 rounded-sm px-4 py-3 font-sans text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400/20 transition-colors w-full resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-terracotta-500 px-8 py-4 font-sans text-sm font-medium text-cream shadow-glow transition-all duration-300 hover:bg-terracotta-600 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
              >
                <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} />
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-beige-100 border-t border-beige-200 py-10 text-center">
        <p className="font-sans text-sm text-charcoal-500">
          Prefer to browse first?{" "}
          <Link href="/shop" className="text-terracotta-600 font-medium hover:underline">
            Explore our catalog &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
