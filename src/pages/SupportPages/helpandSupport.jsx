import React, { useState } from 'react';
import {
  HelpCircle, BookOpen, MessageSquare, Mail, Phone, Users, Bug, ChevronDown, Send, CheckCircle, XCircle, ArrowRight
} from 'lucide-react';

// Accordion Item Component
const AccordionItem = ({ title, content, isOpen, onClick }) => {
  return (
    <div className="accordion-item mb-2 rounded-lg overflow-hidden border border-gray-700">
      <div
        className="accordion-header flex justify-between items-center p-4 cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
        onClick={onClick}
      >
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <ChevronDown
          size={20}
          className={`text-gray-400 accordion-icon ${isOpen ? 'rotate' : ''}`}
        />
      </div>
      <div
        className={`accordion-content bg-gray-800 text-gray-300 transition-all duration-300 ease-in-out ${
          isOpen ? 'active max-h-[500px] py-4 px-4' : 'max-h-0 py-0 px-4'
        }`}
      >
        <p className="leading-relaxed text-sm">{content}</p>
      </div>
    </div>
  );
};

// Help & Support Page Component
const HelpAndSupportPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    newsletter: false,
  });
  const [formStatus, setFormStatus] = useState(null); // 'success' or 'error'

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          title: 'How do I create a new account?',
          content:
            'Click the "Sign Up" button on the homepage, fill in your details (email, password), and follow the verification steps sent to your email. It takes less than a minute!',
        },
        {
          title: 'How do I set up my profile?',
          content:
            'After logging in, navigate to "My Profile" from the top right menu. You can then edit your name, bio, profile picture, and cover photo by clicking the "Edit Profile" button.',
        },
        {
          title: 'What are the basic steps to upload my first project?',
          content:
            'From your dashboard, click "New Project." Follow the prompts to name your project, upload audio files, and then use our AI tools to enhance or generate content.',
        },
      ],
    },
    {
      category: 'Account Management',
      questions: [
        {
          title: 'How can I change my password or email address?',
          content:
            'Go to "Settings" (usually found under your profile dropdown). You\'ll find options there to update your password and email securely.',
        },
        {
          title: 'What should I do if I forget my login credentials?',
          content:
            'On the login page, click "Forgot Password?" and enter your registered email. We\'ll send you a link to reset your password.',
        },
        {
            title: 'How do I update my billing information?',
            content:
              'Access the "Billing & Subscriptions" section within your "Settings" to manage payment methods and view your transaction history.',
          },
      ],
    },
    {
        category: 'Features & Functionality',
        questions: [
          {
            title: 'How do I use the AI Audio Generation tools?',
            content:
              'Within a project, select the "AI Tools" tab. You\'ll find options for script generation, voice cloning, mixing, and more. Each tool has a dedicated mini-tutorial upon first use.',
          },
          {
            title: 'What are the best practices for Prompt Engineering?',
            content:
              'For optimal results, be clear, concise, and specific with your prompts. Experiment with different phrasing and provide context. Our "Guides & Tutorials" section has an in-depth guide on this.',
          },
          {
              title: 'Can I collaborate with other users on projects?',
              content:
                'Yes! Open a project and click the "Share" or "Collaborate" icon. You can invite other users by their username or email to work together.',
            },
        ],
      },
      {
        category: 'Troubleshooting',
        questions: [
          {
            title: 'Why is my audio not uploading?',
            content:
              'Check your internet connection, ensure the file format is supported (MP3, WAV, etc.), and verify the file size is within limits. If issues persist, contact support with details.',
          },
          {
            title: 'What do I do if a feature isn\'t working correctly?',
            content:
              'Try clearing your browser cache and cookies, or try using a different browser. If the problem continues, please report it via our "Submit a Request" form with screenshots and specific steps to reproduce the issue.',
          },
        ],
      },
  ];

  const handleFaqClick = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null); // Reset status

    // Simple client-side validation
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    console.log('Form Data Submitted:', formData);

    try {
      // Simulate API call
      const response = await new Promise(resolve => setTimeout(() => {
        resolve({ success: true, message: 'Your request has been submitted successfully!' });
      }, 1500)); // Simulate 1.5 second network delay

      if (response.success) {
        setFormStatus('success');
        setFormData({ // Clear form on success
          name: '',
          email: '',
          category: '',
          subject: '',
          message: '',
          newsletter: false,
        });
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setFormStatus('error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white font-inter py-8">
      {/* Increased max-w-6xl for more width */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Help & Support
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Welcome to our support center! We're here to ensure you have a smooth and productive experience. Find answers to your questions or connect with our team.
          </p>
        </header>

        <main className="space-y-12"> {/* Increased space-y for more separation */}
          {/* FAQs Section */}
          <div className="text-center"> {/* Centered heading */}
            <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center justify-center">
              <HelpCircle size={28} className="mr-3 text-blue-500" /> Frequently Asked Questions
            </h2>
            <section className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                <p className="text-gray-300 mb-6">
                    Find quick answers to the most common questions about our platform, features, and troubleshooting.
                </p>
                <div className="space-y-3">
                {faqs.map((categoryData, catIndex) => (
                    <div key={catIndex} className="mb-6 last:mb-0">
                    <h3 className="text-xl font-semibold text-teal-300 mb-3 text-left">{categoryData.category}</h3> {/* Aligned left */}
                    {categoryData.questions.map((faq, qIndex) => (
                        <AccordionItem
                        key={qIndex}
                        title={faq.title}
                        content={faq.content}
                        isOpen={openFaqIndex === `${catIndex}-${qIndex}`}
                        onClick={() => handleFaqClick(`${catIndex}-${qIndex}`)}
                        />
                    ))}
                    </div>
                ))}
                </div>
            </section>
          </div>

          {/* Guides & Tutorials Section */}
          <div className="text-center"> {/* Centered heading */}
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center justify-center">
              <BookOpen size={28} className="mr-3 text-green-500" /> Guides & Tutorials
            </h2>
            <section className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
              <p className="text-gray-300 mb-6">
                  Dive deeper with our detailed guides and step-by-step tutorials to master various aspects of our platform.
              </p>
              <ul className="list-disc list-inside space-y-3 text-gray-300 text-left"> {/* Aligned left */}
                <li><a href="#" className="text-blue-400 hover:underline">User Manual: A complete guide to every feature and setting.</a></li>
                <li><a href="#" className="text-blue-400 hover:underline">Video Tutorials: Visual walkthroughs for key functionalities.</a></li>
                <li><a href="#" className="text-blue-400 hover:underline">Best Practices for AI Content Creation: Tips and tricks to get the most out of our AI tools.</a></li>
                <li><a href="#" className="text-blue-400 hover:underline">Privacy & Security Guide: Understand how we protect your data.</a></li>
              </ul>
            </section>
          </div>

          {/* Contact Support Section */}
          <div className="text-center"> {/* Centered heading */}
            <h2 className="text-3xl font-bold text-purple-400 mb-6 flex items-center justify-center">
              <MessageSquare size={28} className="mr-3 text-purple-500" /> Contact Support
            </h2>
            <section className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
              <p className="text-gray-300 mb-6">
                  Can't find what you're looking for? Our dedicated support team is ready to assist you. Please choose the best option for your query.
              </p>

              {/* Contact Form */}
              <h3 className="text-2xl font-bold text-indigo-300 mb-5 text-left">Submit a Request</h3> {/* Aligned left */}
              <p className="text-gray-400 mb-4 text-left">Use the form below to send us a message directly. We aim to respond within **24-48 business hours**.</p>

              <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-900 rounded-lg border border-gray-700 shadow-inner text-left"> {/* Aligned left */}
                  {formStatus === 'success' && (
                      <div className="bg-green-600 bg-opacity-30 border border-green-500 text-green-100 px-4 py-3 rounded-md flex items-center mb-4">
                          <CheckCircle size={20} className="mr-2" />
                          <span>Your request has been submitted successfully! We'll get back to you soon.</span>
                      </div>
                  )}
                  {formStatus === 'error' && (
                      <div className="bg-red-600 bg-opacity-30 border border-red-500 text-red-100 px-4 py-3 rounded-md flex items-center mb-4">
                          <XCircle size={20} className="mr-2" />
                          <span>There was an error submitting your request. Please try again later.</span>
                      </div>
                  )}

                  <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                      <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter your full name"
                      />
                  </div>

                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Your Email Address</label>
                      <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g., yourname@example.com"
                      />
                  </div>

                  <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category of Inquiry</label>
                      <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                          <option value="">Please select...</option>
                          <option value="account_issue">Account Issue</option>
                          <option value="technical_support">Technical Support / Bug Report</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="feature_request">Feature Request</option>
                          <option value="general_inquiry">General Inquiry</option>
                          <option value="feedback">Feedback</option>
                      </select>
                  </div>

                  <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                      <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Briefly describe your issue"
                      />
                  </div>

                  <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Your Message</label>
                      <textarea
                          id="message"
                          name="message"
                          rows="5"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Provide a detailed description of your problem or request."
                      ></textarea>
                  </div>

                  <div className="flex items-center">
                      <input
                          type="checkbox"
                          id="newsletter"
                          name="newsletter"
                          checked={formData.newsletter}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                      />
                      <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-400">
                          Send me occasional updates and news (optional)
                      </label>
                  </div>

                  <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors duration-200"
                  >
                      <Send size={20} className="mr-2" /> Submit Request
                  </button>
              </form>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-center"> {/* Aligned left in individual cards */}
                  <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 flex flex-col items-center">
                      <MessageSquare size={24} className="text-orange-400 mb-3" />
                      <h3 className="font-semibold text-xl text-orange-300 mb-2">Live Chat</h3>
                      <p className="text-gray-400 text-sm">For immediate assistance during business hours, connect with us via live chat.</p>
                      <p className="text-gray-500 text-xs mt-1">Availability: Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                      <button className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full flex items-center transition-colors duration-200 shadow-md text-sm">
                          Start Chat <ArrowRight size={16} className="ml-2" />
                      </button>
                  </div>
                  <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 flex flex-col items-center">
                      <Mail size={24} className="text-red-400 mb-3" />
                      <h3 className="font-semibold text-xl text-red-300 mb-2">Email Us Directly</h3>
                      <p className="text-gray-400 text-sm">If you prefer to use your own email client, you can reach us at:</p>
                      <a href="mailto:support@yourplatform.com" className="text-blue-400 hover:underline mt-1 font-medium">support@yourplatform.com</a>
                      <p className="text-gray-500 text-xs mt-1">Expect a response within 24-48 business hours.</p>
                  </div>
                  <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 flex flex-col items-center">
                      <Phone size={24} className="text-yellow-400 mb-3" />
                      <h3 className="font-semibold text-xl text-yellow-300 mb-2">Phone Support</h3>
                      <p className="text-gray-400 text-sm">For urgent matters, you can call us:</p>
                      <a href="tel:+919876543210" className="text-blue-400 hover:underline mt-1 font-medium">+91-98765-43210</a>
                      <p className="text-gray-500 text-xs mt-1">Availability: Monday - Friday, 10:00 AM - 5:00 PM IST</p>
                  </div>
                  <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 flex flex-col items-center">
                      <Users size={24} className="text-pink-400 mb-3" />
                      <h3 className="font-semibold text-xl text-pink-300 mb-2">Community Forum</h3>
                      <p className="text-gray-400 text-sm">Join our community to connect with other users, share tips, and find solutions.</p>
                      <a href="#" className="mt-4 px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full flex items-center justify-center text-sm transition-colors duration-200">
                          Visit Forum <ArrowRight size={16} className="ml-2" />
                      </a>
                  </div>
              </div>
            </section>
          </div>

          {/* Report an Issue Section */}
          <div className="text-center"> {/* Centered heading */}
            <h2 className="text-3xl font-bold text-gray-300 mb-6 flex items-center justify-center">
              <Bug size={28} className="mr-3 text-red-500" /> Report an Issue
            </h2>
            <section className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
              <p className="text-gray-300 mb-6">
                  If you've found a bug or encountered a security vulnerability, please help us improve by reporting it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#" className="flex-1 text-center py-3 px-6 border border-red-500 text-red-300 rounded-md font-medium hover:bg-red-900 hover:bg-opacity-20 transition-colors duration-200">
                      Submit Bug Report
                  </a>
                  <a href="#" className="flex-1 text-center py-3 px-6 border border-red-500 text-red-300 rounded-md font-medium hover:bg-red-900 hover:bg-opacity-20 transition-colors duration-200">
                      Security Vulnerability Disclosure
                  </a>
              </div>
            </section>
          </div>
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Your Platform Name. All rights reserved.</p>
            <p className="mt-2">Located in Malayambakkam, Tamil Nadu, India.</p>
        </footer>
      </div>
    </div>
  );
};

export default HelpAndSupportPage;