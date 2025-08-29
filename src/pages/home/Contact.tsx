import axios from "axios";
import { useState, ChangeEvent, FormEvent } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

// ✅ Form data type
interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// ✅ Errors type (each field optional)
interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Properly typed change handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };

  // ✅ Validation with correct typing
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    return newErrors;
  };

  // ✅ Typed submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACK_URL}/contact/contact`,
        formData
      );
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error("Error submitting message.");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[85%] pt-14 md:pt-0 mx-auto mb-10">
      <h1 className="text-3xl font-semibold mb-5">Get In Touch</h1>
      <div className="bg-[#F6F6F6] rounded-[1.125rem]">
        <div className="p-4 md:p-10 flex flex-col md:flex-row gap-5 md:gap-8">
          <div className="md:w-1/2">
            <img
              loading="lazy"
              className="rounded-[1.125rem]"
              src="/contact.png"
              alt="Contact"
            />
          </div>

          <form className="md:w-1/2 flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              className="bg-[#FFFFFF] rounded-[1.125rem] p-4 border border-[#D9D9D9]"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <input
              className="bg-[#FFFFFF] rounded-[1.125rem] p-4 border border-[#D9D9D9]"
              placeholder="Your Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
              className="bg-[#FFFFFF] rounded-[1.125rem] p-4 border border-[#D9D9D9]"
              placeholder="Your Phone Number"
              name="phone"
              type="tel"
              maxLength={10}
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

            <textarea
              className="bg-[#FFFFFF] rounded-[1.125rem] p-4 border border-[#D9D9D9] h-[120px] resize-none"
              placeholder="Your Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
            />
            {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`bg-[#579B52] text-white py-[2.5%] rounded-[1.125rem] cursor-pointer hover:bg-[#40753c] transition-all duration-100 ${
                loading && "opacity-50 cursor-not-allowed"
              }`}
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
