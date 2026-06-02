"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Loader2, X, Plus, Upload, FileText } from "lucide-react";
import { useSession } from "next-auth/react";

const QUALIFICATIONS = [
  { value: "UG", label: "Under Graduate (Student)" },
  { value: "EMPLOYED", label: "Employed" },
  { value: "UNEMPLOYED", label: "Unemployed" },
];

const ID_TYPES: Record<string, string[]> = {
  UG: ["STUDENT_ID", "AADHAAR", "PAN"],
  EMPLOYED: ["AADHAAR", "PAN", "PAY_SLIP"],
  UNEMPLOYED: ["AADHAAR", "PAN"],
};

const ID_LABELS: Record<string, string> = {
  STUDENT_ID: "Student ID",
  AADHAAR: "Aadhaar Card",
  PAN: "PAN Card",
  PAY_SLIP: "Pay Slip",
};

const EXPERIENCE_LEVELS = [
  { value: "FRESHER", label: "Fresher" },
  { value: "ONE_TO_TWO_YEARS", label: "1-2 Years" },
  { value: "THREE_TO_FIVE_YEARS", label: "3-5 Years" },
  { value: "FIVE_TO_EIGHT_YEARS", label: "5-8 Years" },
  { value: "EIGHT_PLUS_YEARS", label: "8+ Years" },
];

interface CertificateData {
  name: string;
  file: File;
}

export default function EngineerFormPage() {
  const router = useRouter();
  const { status } = useSession();
  const [qualification, setQualification] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [yearsOfExperience, setYearsOfExperience] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [certifications, setCertifications] = useState<CertificateData[]>([]);
  const [certInput, setCertInput] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register/engineer");
    }
  }, [status, router]);

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) setSkills([...skills, val]);
    setSkillInput("");
  };

  const addCertificate = () => {
    const val = certInput.trim();
    if (!val) {
      setError("Please enter the certificate name.");
      return;
    }
    if (!certFile) {
      setError("Please upload the proof document for the certificate.");
      return;
    }
    setError("");
    setCertifications([...certifications, { name: val, file: certFile }]);
    setCertInput("");
    setCertFile(null);
  };

  const removeCertificate = (indexToRemove: number) => {
    setCertifications(certifications.filter((_, idx) => idx !== indexToRemove));
  };

  const handleQualificationChange = (val: string) => {
    setQualification(val);
    setIdType("");
    setIdNumber("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!idFile) { setError("Please upload your ID document"); return; }
    if (skills.length === 0) { setError("Please add at least one skill"); return; }

    const cleanedId = idNumber.replace(/\s+/g, '').toUpperCase();

    if (idType === "PAN") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanedId)) {
        setError("Invalid PAN format. It should be 5 letters, 4 numbers, and 1 letter (e.g., ABCDE1234F)");
        return;
      }
    }

    if (idType === "AADHAAR") {
      const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
      if (!aadhaarRegex.test(cleanedId)) {
        setError("Invalid Aadhaar format. It must be exactly 12 digits and cannot start with 0 or 1.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("qualification", qualification);
      formData.append("yearsOfExperience", yearsOfExperience);
      formData.append("idType", idType);
      formData.append("idNumber", cleanedId);
      formData.append("file", idFile);
      formData.append("skills", JSON.stringify(skills));

      const mappedCertifications = certifications.map((cert, index) => {
        formData.append(`certFile_${index}`, cert.file);
        return { name: cert.name, fileIndex: index };
      });
      formData.append("certifications", JSON.stringify(mappedCertifications));

      const res = await fetch("/api/engineer/profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      router.push("/form/payout");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8fafd] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#f0b31e]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex w-full h-screen">
      <div className="w-[50%] h-screen">
        <div className="flex items-center justify-center px-4 py-8 font-sans w-full">

          {/* Increased around 30% from previous small version */}
          <div className="w-160 scale-[0.95] origin-top">

            {/* Header */}
            <div className="mb-10 flex flex-col items-center justify-center">
              <h1 className="text-[42px] leading-[1] font-black tracking-[-1.8px] text-[#0F172A] flex items-center gap-2">
                Hey, Join us Today!
                <span className="text-2xl">👀</span>
              </h1>

              <p className="text-[#7B6A42] text-[15px] leading-[1.5] mt-4 max-w-[360px] font-medium">
                Today is a new day. It's your day. You shape it.
                Sign in to start connection with other business.
              </p>
            </div>

            {/* Progress */}
            <div className="relative mb-10 px-1">

              {/* Line */}
              <div className="absolute top-3.5 left-0 right-0 h-[2px] bg-[#F0B31E]" />

              <div className="relative flex justify-between items-center">

                {/* Step 1 */}
                <div className="flex flex-col items-start">
                  <div className="w-7 h-7 rounded-full bg-[#F0B31E] text-white flex items-center justify-center text-[12px] font-semibold shadow-md shadow-yellow-500/30">
                    1
                  </div>

                  <p className="text-[10px] text-[#C98F00] mt-2 font-medium">
                    Basic Credentials
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-end">
                  <div className="w-7 h-7 rounded-full bg-[#F0B31E] text-white flex items-center justify-center text-[12px] font-semibold shadow-md shadow-yellow-500/30">
                    2
                  </div>

                  <p className="text-[10px] text-[#C98F00] mt-2 font-medium">
                    Company Details
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-6">

              {/* Qualification */}
              <div className="space-y-2">
                <label className="text-[15px] font-semibold text-[#111827]">
                  Qualification
                </label>

                <div className="flex gap-3">
                  {QUALIFICATIONS.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => handleQualificationChange(q.value)}
                      className={`flex-1 h-[52px] rounded-[16px] border text-[13px] font-semibold transition-all ${qualification === q.value
                        ? "bg-[#F0B31E] text-white border-[#F0B31E] shadow-lg shadow-yellow-500/20"
                        : "text-[#8A7440]"
                        }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <label className="text-[15px] font-semibold text-[#111827]">
                  Years of Experience
                </label>

                <select
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className="w-full h-[56px] px-5 rounded-[16px] border text-[#8A7440] text-[14px] outline-none focus:border-[#F0B31E]"
                >
                  <option value="" disabled>
                    Select experience level
                  </option>

                  {EXPERIENCE_LEVELS.map((exp) => (
                    <option key={exp.value} value={exp.value}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ID Type */}
              {qualification && (
                <div className="space-y-2">
                  <label className="text-[15px] font-semibold text-[#111827]">
                    ID Type
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {ID_TYPES[qualification].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setIdType(type);
                          setIdNumber("");
                          setError("");
                        }}
                        className={`px-5 h-[46px] rounded-[16px] border text-[12px] font-semibold transition-all ${idType === type
                          ? "bg-[#F0B31E] text-white border-[#F0B31E] shadow-lg shadow-yellow-500/20"
                          : " text-[#8A7440]"
                          }`}
                      >
                        {ID_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ID Number */}
              <div className="space-y-2">
                <label className="text-[15px] font-semibold text-[#111827]">
                  ID Number
                </label>

                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                  placeholder={
                    idType === "PAN"
                      ? "ABCDE1234F"
                      : idType === "AADHAAR"
                        ? "12 Digit Number"
                        : "Enter your ID number"
                  }
                  className="w-full h-[56px] px-5 rounded-[16px] border text-[#8A7440] text-[14px] outline-none"
                />
              </div>

              {/* Upload */}
              <div className="space-y-2">
                <label className="text-[15px] font-semibold text-[#111827]">
                  Upload ID Document
                </label>

                <label className="w-full h-[56px] rounded-[16px] border flex items-center px-5 cursor-pointer">

                  <Upload className="h-4 w-4 text-[#B08D32]" />

                  <span className="ml-3 text-[#8A7440] text-[13px] truncate">
                    {idFile ? idFile.name : "Click to upload (JPG, PNG, PDF)"}
                  </span>

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-[15px] font-semibold text-[#111827]">
                  Skills
                </label>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="e.g. Arduino, PCB Design"
                    className="flex-1 h-[56px] px-5 rounded-[16px] border text-[#8A7440] text-[14px] outline-none"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="w-[56px] h-[56px] rounded-[16px] bg-[#F0B31E] text-white flex items-center justify-center shadow-lg shadow-yellow-500/25"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !qualification || !idType}
                className="
    w-full
    h-[62px]
    mt-7
    rounded-[18px]
    bg-[#F0B31E]
    hover:bg-[#DE9F08]
    text-white
    text-[19px]
    font-semibold
    transition-all
    shadow-[0_10px_30px_rgba(240,179,30,0.35)]
    disabled:opacity-60
    disabled:cursor-not-allowed
  "
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="w-[50%] rounded-[40px] relative overflow-hidden p-10 flex flex-col justify-between mt-6 mr-6">

        {/* MAIN YELLOW GRADIENT LIKE REFERENCE IMAGE */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#FFF6D6_0%,#F8D978_18%,#F0B31E_45%,#E8A400_65%,#FFF1C2_100%)]" />

        {/* Soft White Glow Top Left */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-white/10 blur-[140px] rounded-full" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-white/50 blur-[140px] rounded-full" />

        {/* Warm Golden Glow Center */}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-[#FFD65C]/40 blur-[120px] rounded-full" />

        {/* Light Cream Glow Right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FFF3CF]/60 blur-[140px] rounded-full" />

        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.12] mix-blend-soft-light bg-[url('https://www.transparenttextures.com/patterns/noise.png')]" />

        {/* Overlay Fade */}
        <div className="absolute inset-0 bg-white/[0.08]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full ">

          <div className="mt-20">
            {/* Logo */}
            <div className="w-24 h-24 bg-white rounded-sm flex items-center justify-center text-black font-bold text-sm shadow-xl">
              LOGO
            </div>

            {/* Hero */}
            <div className="mt-12">
              <h1 className="text-white text-7xl font-extrabold tracking-tight leading-none">
                TECH ENGI
              </h1>

              <p className="text-white/85 text-lg max-w-xl mt-4 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur. Suscipit sed amet commodo vel
                ultrices tortor orci. Enim lectus turpis augue donec. Gravida non
              </p>
            </div>
          </div>

          {/* Bottom */}
          {/* Bottom Section */}
          <div className="mt-auto pt-28">

            {/* Testimonials */}
            <div className="flex gap-6 overflow-hidden">

              {/* Card 1 */}
              <div
                className="
        min-w-[420px]
        rounded-3xl
        border
        border-white/20
        bg-white/[0.12]
        backdrop-blur-2xl
        p-6
        shadow-[0_10px_40px_rgba(255,190,40,0.15)]
      "
              >
                <p className="text-white/90 text-sm leading-relaxed font-medium">
                  Dude, your stuff is the bomb! House rent is the real deal! I
                  STRONGLY recommend house rent to EVERYONE interested in running a
                  successful online business!
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <img
                    src="https://i.pravatar.cc/100?img=32"
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-white/30"
                  />

                  <div>
                    <h4 className="text-white font-semibold text-sm">
                      Lana Bernier
                    </h4>

                    <p className="text-white/70 text-xs">
                      Senior Paradigm Strategist
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="
        min-w-[420px]
        rounded-3xl
        border
        border-white/20
        bg-white/[0.12]
        backdrop-blur-2xl
        p-6
        shadow-[0_10px_40px_rgba(255,190,40,0.15)]
      "
              >
                <p className="text-white/90 text-sm leading-relaxed font-medium">
                  Dude, your stuff is the bomb! House rent is the real deal! I
                  STRONGLY recommend house rent to EVERYONE interested in running a
                  successful online business!
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <img
                    src="https://i.pravatar.cc/100?img=12"
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-white/30"
                  />

                  <div>
                    <h4 className="text-white font-semibold text-sm">
                      Lana Bernier
                    </h4>

                    <p className="text-white/70 text-xs">
                      Senior Paradigm Strategist
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end mt-16 gap-4 pr-2">
              <div className="w-32 h-[2px] bg-white/70" />

              <p className="text-white text-3xl font-light tracking-tight">
                Build for connectivity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}