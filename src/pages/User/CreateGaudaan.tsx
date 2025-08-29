import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone, FileRejection, DropEvent } from "react-dropzone";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { GiCow } from "react-icons/gi";
import { useAuth } from "../../authContext/Auth";

// Constants
const MAX_IMAGES = 2;
const MAX_SIZE_MB = 8;

// Define interfaces for type safety
interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  pickupDate: string;
  pickupTime: string;
  images: File[];
  governmentId: string;
  animalRegisteredId: string;
  animalType: "cow" | "buffalo" | "other";
  animalCondition: "healthy" | "sick" | "injured";
  animalDescription: string;
  consent: boolean;
}

interface User {
  name?: string;
  email?: string;
  phone?: string;
}

interface AuthContext {
  authorizationToken: string;
}

const CreateGaudaan: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContext;
  const navigate = useNavigate();
  const [isAnimalRegistered, setIsAnimalRegistered] = useState<boolean>(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [globalError, setGlobalError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      pickupDate: "",
      pickupTime: "",
      images: [],
      governmentId: "",
      animalRegisteredId: "",
      animalType: "cow",
      animalCondition: "healthy",
      animalDescription: "",
      consent: false,
    },
  });

  const imageFiles = watch("images");

  // Fetch user data for pre-filling
  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      try {
        if (!authorizationToken) return;
        const { data } = await axios.get<{ user: User }>(
          `${import.meta.env.VITE_BACK_URL}/auth/auth`,
          {
            headers: { Authorization: authorizationToken },
          }
        );
        const user = data.user || {};
        setValue("name", user.name || "");
        setValue("email", user.email || "");
        setValue("phone", user.phone || "");
      } catch (err: any) {
        console.error("User fetch failed:", err);
        toast.error("Failed to fetch user data");
      }
    };
    fetchUser();
  }, [authorizationToken, setValue]);

  // Clean up image previews
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Validate images on change
  useEffect(() => {
    if (imageFiles.length === 0) {
      setError("images", {
        type: "required",
        message: "At least one image is required",
      });
    } else {
      clearErrors("images");
    }
  }, [imageFiles, setError, clearErrors]);

  // Handle image drop
  const onDrop = (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => {
    const validNewFiles = acceptedFiles.filter(
      (file) => file.size <= MAX_SIZE_MB * 1024 * 1024
    );

    const totalImages = imageFiles.length + validNewFiles.length;
    if (totalImages > MAX_IMAGES) {
      setGlobalError(`You can only upload up to ${MAX_IMAGES} images.`);
      toast.error(`Cannot upload more than ${MAX_IMAGES} images.`);
      return;
    }

    if (fileRejections.length > 0) {
      const reasons = fileRejections.map((rejection) => {
        if (rejection.errors.some((err) => err.code === "file-too-large")) {
          return `File "${rejection.file.name}" exceeds ${MAX_SIZE_MB}MB.`;
        }
        if (rejection.errors.some((err) => err.code === "file-invalid-type")) {
          return `File "${rejection.file.name}" is not a supported image type.`;
        }
        return rejection.errors.map((err) => err.message).join(", ");
      });
      setGlobalError(`Some files were rejected: ${reasons.join(" ")}`);
      toast.error(`Some files were rejected: ${reasons.join(" ")}`);
      return;
    }

    setGlobalError("");
    const newImages = [...imageFiles, ...validNewFiles];
    setValue("images", newImages, { shouldValidate: true });
    const newPreviews = validNewFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    multiple: true,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
  });

  const handleRemoveImage = (index: number): void => {
    const updatedImages = [...imageFiles];
    const updatedPreviews = [...imagePreviews];
    updatedImages.splice(index, 1);
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setValue("images", updatedImages, { shouldValidate: true });
    setImagePreviews(updatedPreviews);
    setGlobalError("");
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    // Validate images
    if (data.images.length === 0) {
      setError("images", {
        type: "required",
        message: "At least one image is required",
      });
      toast.error("Please upload at least one image.");
      return;
    }
    clearErrors("images");

    // Validate animalDescription
    if (!data.animalDescription) {
      setError("animalDescription", {
        type: "required",
        message: "Animal description is required",
      });
      toast.error("Animal description is required.");
      return;
    }
    if (data.animalDescription.length < 10) {
      setError("animalDescription", {
        type: "minLength",
        message: "Description must be at least 10 characters",
      });
      toast.error("Description must be at least 10 characters.");
      return;
    }
    if (data.animalDescription.length > 500) {
      setError("animalDescription", {
        type: "maxLength",
        message: "Description cannot exceed 500 characters",
      });
      toast.error("Description cannot exceed 500 characters.");
      return;
    }
    clearErrors("animalDescription");

    setLoading(true);
    try {
      const formData = new FormData();
      if (!isAnimalRegistered) {
        data.animalRegisteredId = "not_registered";
      }
      Object.entries(data).forEach(([key, value]) => {
        if (value == null) return; 

        if (key === "images" && Array.isArray(value)) {
          value.forEach((file) => {
            if (file instanceof File) {
              formData.append("images", file);
            }
          });
        } else {
          formData.append(key, String(value));
        }
      });

      await axios.post(
        `${import.meta.env.VITE_BACK_URL}/auth/gaudaan`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: authorizationToken,
          },
        }
      );
      toast.success("Gaudaan submitted successfully!");
      reset();
      setImagePreviews([]);
      navigate("/gaudaan-details");
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast.error(
        `Error submitting form: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8 space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center text-green-700 flex items-center justify-center gap-3">
          <GiCow size={36} className="text-green-800" />
          Gaudaan Donation Form
        </h2>

        {globalError && (
          <p className="text-center text-red-600 bg-red-50 p-3 rounded-lg">
            {globalError}
          </p>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Donor Name
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            type="text"
            disabled
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-green-500 transition"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email format",
                },
              })}
              type="email"
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-green-500 transition"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone
            </label>
            <input
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              })}
              type="tel"
              maxLength={10}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
              placeholder="9876543210"
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Pickup Address
          </label>
          <textarea
            {...register("address", { required: "Address is required" })}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
            placeholder="123 Gaushala Road, Surat"
          />
          {errors.address && (
            <p className="text-sm text-red-500 mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Government ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Government ID (Optional)
          </label>
          <input
            {...register("governmentId", {
              pattern: {
                value: /^\d{12}$|^$/,
                message:
                  "Government ID must be a 12-digit number or left blank",
              },
            })}
            type="text"
            maxLength={12}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
            placeholder="e.g., 123456789012"
          />
          {errors.governmentId && (
            <p className="text-sm text-red-500 mt-1">
              {errors.governmentId.message}
            </p>
          )}
        </div>

        {/* Animal Registered Checkbox */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isAnimalRegistered"
            checked={isAnimalRegistered}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIsAnimalRegistered(e.target.checked)
            }
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label
            htmlFor="isAnimalRegistered"
            className="text-sm font-semibold text-gray-700"
          >
            Animal is already registered
          </label>
        </div>

        {/* Animal Registered ID */}
        {isAnimalRegistered && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Animal Registered ID
            </label>
            <input
              {...register("animalRegisteredId", {
                required: "Animal Registered ID is required",
              })}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
              placeholder="Enter Animal Registration ID"
            />
            {errors.animalRegisteredId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.animalRegisteredId.message}
              </p>
            )}
          </div>
        )}

        {/* Pickup Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Pickup Date
            </label>
            <input
              {...register("pickupDate", {
                required: "Pickup date is required",
              })}
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
            />
            {errors.pickupDate && (
              <p className="text-sm text-red-500 mt-1">
                {errors.pickupDate.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Pickup Time
            </label>
            <input
              {...register("pickupTime", {
                required: "Pickup time is required",
              })}
              type="time"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
            />
            {errors.pickupTime && (
              <p className="text-sm text-red-500 mt-1">
                {errors.pickupTime.message}
              </p>
            )}
          </div>
        </div>

        {/* Animal Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Animal Type
          </label>
          <select
            {...register("animalType", { required: "Animal type is required" })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="cow">Cow</option>
            <option value="buffalo">Buffalo</option>
            <option value="other">Other</option>
          </select>
          {errors.animalType && (
            <p className="text-sm text-red-500 mt-1">
              {errors.animalType.message}
            </p>
          )}
        </div>

        {/* Animal Condition */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Animal Condition
          </label>
          <select
            {...register("animalCondition", {
              required: "Animal condition is required",
            })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="healthy">Healthy</option>
            <option value="sick">Sick</option>
            <option value="injured">Injured</option>
          </select>
          {errors.animalCondition && (
            <p className="text-sm text-red-500 mt-1">
              {errors.animalCondition.message}
            </p>
          )}
        </div>

        {/* Animal Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Animal Description
          </label>
          <textarea
            {...register("animalDescription")}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
            placeholder="Describe the animal (e.g., age, health details)"
          />
          {errors.animalDescription && (
            <p className="text-sm text-red-500 mt-1">
              {errors.animalDescription.message}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Upload Images (Max {MAX_IMAGES}, {MAX_SIZE_MB}MB each, at least 1
            required)
          </label>
          <div
            {...getRootProps()}
            className={`w-full p-6 border-2 border-dashed ${
              isDragActive
                ? "border-green-600 bg-green-100"
                : "border-green-400 bg-green-50"
            } rounded-xl text-center cursor-pointer hover:bg-green-100 transition`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              {isDragActive
                ? "Drop the images here"
                : "Drag & drop or click to select images"}
            </p>
          </div>
          {errors.images && (
            <p className="text-sm text-red-500 mt-1">{errors.images.message}</p>
          )}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {imagePreviews.map((src, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    className="w-full h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs p-1 rounded-full hover:bg-red-700 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consent */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              {...register("consent", {
                required: "You must consent to data processing",
              })}
              type="checkbox"
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              I consent to the processing of my personal data as per the{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                className="text-green-600 hover:underline"
              >
                privacy policy
              </a>
            </span>
          </label>
          {errors.consent && (
            <p className="text-sm text-red-500 mt-1">
              {errors.consent.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            className={`w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition flex justify-center items-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Submitting...
              </div>
            ) : (
              "Submit Gaudaan"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGaudaan;
