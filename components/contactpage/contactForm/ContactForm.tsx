"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { defaultContactFormData } from "./contactFormData";
import { useAppSelector } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import {
  createFormAttemptKey,
} from "@/lib/forms/public-forms-client";

const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG;
const CONTACT_FORM_ID = process.env.NEXT_PUBLIC_CONTACT_FORM_ID;

const iconMap: Record<string, any> = {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
};

interface ContactFormProps {
  data?: any;
}

export const ContactForm: React.FC<ContactFormProps> = ({ data }) => {
  const { currentPages } = useAppSelector((state) => state.pages);
  const { locale } = useParams();
  const lang = (locale as string) || "en";

  const getLocalizedValue = (val: any) => {
    if (!val) return "";
    if (typeof val === "object") {
      return val[lang] || val.en || "";
    }
    return val;
  };

  // Find sections from Redux store currentPages
  const contactInfoSection = useMemo(() => {
    return currentPages?.content?.find(
      (sec: any) => sec.type === "contact-info",
    );
  }, [currentPages]);

  const formSection = useMemo(() => {
    return currentPages?.content?.find((sec: any) => sec.type === "form");
  }, [currentPages]);

  // Resolve Contact Info
  const contactHeading = useMemo(() => {
    const heading =
      contactInfoSection?.props?.sectionHeading ||
      defaultContactFormData.props.sectionHeading;
    return getLocalizedValue(heading);
  }, [contactInfoSection, lang]);

  const contactItems = useMemo(() => {
    if (
      contactInfoSection?.content &&
      Array.isArray(contactInfoSection.content)
    ) {
      return contactInfoSection.content.map((item: any) => ({
        icon: item.props?.icon,
        label: item.props?.label,
        value: item.props?.value,
        href: item.props?.href,
      }));
    }
    return defaultContactFormData.props.contactItems;
  }, [contactInfoSection]);

  // Resolve Form Content
  const formProps = formSection?.props;
  const formConfig = formProps?.form;

  // Render fields from config, if not present fallback to standard default fields
  const defaultFields = useMemo(
    () => [
      {
        id: "field-name",
        type: "text",
        name: "name",
        label: defaultContactFormData.props.nameLabel,
        placeholder: defaultContactFormData.props.namePlaceholder,
        required: true,
      },
      {
        id: "field-email",
        type: "email",
        name: "email",
        label: defaultContactFormData.props.emailLabel,
        placeholder: defaultContactFormData.props.emailPlaceholder,
        required: true,
      },
      {
        id: "field-subject",
        type: "select",
        name: "subject",
        label: defaultContactFormData.props.subjectLabel,
        placeholder: { en: "Select an option", hi: "एक विकल्प चुनें" },
        required: true,
        options: defaultContactFormData.props.subjectOptions
          .filter((opt) => opt.value !== "")
          .map((opt) => ({
            value: opt.value,
            label: opt.label,
          })),
      },
      {
        id: "field-message",
        type: "textarea",
        name: "message",
        label: defaultContactFormData.props.messageLabel,
        placeholder: defaultContactFormData.props.messagePlaceholder,
        required: true,
      },
    ],
    [],
  );

  const fieldsToRender = useMemo(() => {
    return formConfig?.fields || defaultFields;
  }, [formConfig, defaultFields]);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptKey, setAttemptKey] = useState(() =>
    createFormAttemptKey("contact"),
  );

  // Initialize form state
  useEffect(() => {
    const initial: Record<string, any> = {};
    fieldsToRender.forEach((field: any) => {
      const key = field.name || field.id;
      initial[key] = field.type === "checkbox" ? false : "";
    });
    setFormData(initial);
  }, [fieldsToRender]);

  const formHeading =
    getLocalizedValue(formProps?.formHeading) ||
    getLocalizedValue(defaultContactFormData.props.formHeading);
  const formDescription =
    getLocalizedValue(formProps?.formDescription) ||
    getLocalizedValue(defaultContactFormData.props.formDescription);
  const successHeading =
    getLocalizedValue(formProps?.successHeading) ||
    getLocalizedValue(defaultContactFormData.props.successHeading);
  const successDescription =
    getLocalizedValue(formProps?.successDescription) ||
    getLocalizedValue(defaultContactFormData.props.successDescription);
  const successButtonText =
    getLocalizedValue(formProps?.successButtonText) ||
    getLocalizedValue(defaultContactFormData.props.successButtonText);
  const submitButtonText =
    getLocalizedValue(formProps?.submitButtonText) ||
    getLocalizedValue(defaultContactFormData.props.submitButtonText);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const getFieldValue = (keys: string[]) => {
        for (const k of keys) {
          if (formData[k]) return formData[k];
        }
        return '';
      };

      const firstName = getFieldValue(['firstName', 'first_name', 'name']);
      const lastName = getFieldValue(['lastName', 'last_name']);
      
      const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'Unknown Name';
      const email = getFieldValue(['email', 'email_address']) || 'no-email@provided.com';
      const subject = formData.subject || 'New Contact Inquiry';
      
      // Collect any other fields into the message body
      const otherFields = Object.keys(formData)
        .filter(k => !['name', 'firstName', 'lastName', 'first_name', 'last_name', 'email', 'email_address', 'subject'].includes(k))
        .map(k => {
          // format key nicely e.g., 'phone_number' -> 'Phone Number'
          const formattedKey = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `**${formattedKey}:** ${formData[k]}`;
        })
        .join('<br>');
      
      let message = formData.message || '';
      if (otherFields) {
         message = message ? `${message}<br><br><b>Other Details:</b><br>${otherFields}` : otherFields;
      }
      if (!message) message = 'No message provided';

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      setIsSubmitted(true);
      setAttemptKey(createFormAttemptKey("contact"));
      const resetData: Record<string, any> = {};
      fieldsToRender.forEach((f: any) => {
        const key = f.name || f.id;
        resetData[key] = f.type === "checkbox" ? false : "";
      });
      setFormData(resetData);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to send message. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const getFieldGridClass = (type: string) => {
    if (type === "textarea" || type === "checkbox" || type === "terms") {
      return "col-span-2";
    }
    return "col-span-2 md:col-span-1";
  };

  return (
    <div className="bg-secondary/5 border-y border-border/50 relative">
      <section className="py-32 px-[5%] max-w-7xl mx-auto relative z-10">
        {/* Background Decorators */}
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[30%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid lg:grid-cols-[1.2fr_1.8fr] gap-16 lg:gap-24 relative">
        {/* Left Side: Info Cards */}
        <div className="space-y-16 py-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <EditableText value={contactHeading}
                currentPages={currentPages}
                sectionId={contactInfoSection?.id}
                fieldPath="props.sectionHeading" tag="h2" className="text-[40px] font-black mb-12 tracking-tight  text-foreground" />
            
            <div className="space-y-6">
              {contactItems?.map((item: any, index: number) => {
                const IconComponent = iconMap[item.icon] || MapPin;
                return (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.6 }}
                    className="group cursor-pointer bg-surface/30 hover:bg-surface/60 backdrop-blur-md border border-white/10 hover:border-white/20 p-6 rounded-3xl transition-all duration-500 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center gap-5 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#98c45f]/20 border border-[#98c45f]/30 flex items-center justify-center text-[#063A1D] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:bg-[#063A1D] group-hover:text-[#ffffff] shadow-sm">
                        <IconComponent size={22} strokeWidth={2.5} />
                      </div>
                      <span className="text-[12px] font-bold uppercase tracking-[3px] text-muted group-hover:text-[#063A1D] transition-colors">
                        <EditableText
                          value={getLocalizedValue(item.label)}
                          currentPages={currentPages}
                          sectionId={contactInfoSection?.id}
                          fieldPath={`content.${index}.props.label`}
                        />
                      </span>
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-lg md:text-xl font-bold tracking-tight inline-block text-[#063A1D] group-hover:text-[#98c45f] transition-colors [&_*]:!text-[#063A1D] group-hover:[&_*]:!text-[#98c45f]"
                      >
                        <EditableText
                          value={getLocalizedValue(item.value)}
                          currentPages={currentPages}
                          sectionId={contactInfoSection?.id}
                          fieldPath={`content.${index}.props.value`}
                        />
                      </a>
                    ) : (
                      <p className="text-lg md:text-xl font-bold tracking-tight text-[#063A1D] group-hover:text-[#98c45f] transition-colors [&_*]:!text-[#063A1D] group-hover:[&_*]:!text-[#98c45f]">
                        <EditableText
                          value={getLocalizedValue(item.value)}
                          currentPages={currentPages}
                          sectionId={contactInfoSection?.id}
                          fieldPath={`content.${index}.props.value`}
                        />
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <div className="bg-surface/50 backdrop-blur-2xl border border-white/20 p-8 md:p-12 lg:p-16 rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.08)] relative z-10 overflow-hidden">
            {/* Inner subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
            
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 text-center relative z-10"
              >
                <div className="w-28 h-28 bg-gradient-to-br from-secondary/20 to-primary/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <CheckCircle2 size={56} strokeWidth={2} />
                </div>
                <EditableText value={successHeading}
                    currentPages={currentPages}
                    sectionId={formSection?.id}
                    fieldPath="props.successHeading" tag="h3" className="text-[40px] font-black mb-6 tracking-tight text-foreground" />
                <div className="text-muted font-medium mb-12 text-lg md:text-xl max-w-md mx-auto">
                  <EditableText
                    value={successDescription}
                    currentPages={currentPages}
                    sectionId={formSection?.id}
                    fieldPath="props.successDescription"
                    tag="p"
                  />
                </div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-foreground text-background px-12 h-14 rounded-full text-[15px] font-bold uppercase tracking-[2px] hover:scale-105 hover:bg-primary hover:text-white transition-all duration-300 shadow-xl cursor-pointer"
                >
                  <EditableText
                    value={successButtonText}
                    currentPages={currentPages}
                    sectionId={formSection?.id}
                    fieldPath="props.successButtonText"
                  />
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
                <div className="space-y-3">
                  <EditableText value={formHeading}
                      currentPages={currentPages}
                      sectionId={formSection?.id}
                      fieldPath="props.formHeading" tag="h3" className="text-[32px] md:text-[40px] font-black tracking-tight mb-2 text-foreground" />
                  <div className="text-muted font-medium text-lg">
                    <EditableText
                      value={formDescription}
                      currentPages={currentPages}
                      sectionId={formSection?.id}
                      fieldPath="props.formDescription"
                      tag="p"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 md:gap-10">
                  {fieldsToRender.map((field: any) => {
                    const fieldKey = field.name || field.id;
                    const gridClass = getFieldGridClass(field.type);

                    return (
                      <div key={field.id} className={`${gridClass} relative group`}>
                        <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-3 flex items-center gap-1 select-none">
                          {getLocalizedValue(field.label)}
                          {field.required && (
                             <span className="text-secondary font-black ml-0.5">*</span>
                          )}
                        </label>

                        {field.type === "textarea" ? (
                          <div className="relative">
                            <textarea
                              required={field.required}
                              name={fieldKey}
                              value={formData[fieldKey] || ""}
                              onChange={handleChange}
                              placeholder={getLocalizedValue(field.placeholder)}
                              className="w-full bg-surface/40 backdrop-blur-sm border border-border/60 hover:border-border/80 focus:border-secondary focus:ring-1 focus:ring-secondary/50 rounded-2xl p-5 outline-none transition-all font-medium text-base text-foreground placeholder:text-muted/60 min-h-[140px] resize-y"
                            />
                          </div>
                        ) : field.type === "select" ? (
                          <div className="relative">
                            <select
                              required={field.required}
                              name={fieldKey}
                              value={formData[fieldKey] || ""}
                              onChange={handleChange}
                              className="w-full bg-surface/40 backdrop-blur-sm border border-border/60 hover:border-border/80 focus:border-secondary focus:ring-1 focus:ring-secondary/50 rounded-2xl px-5 py-4 outline-none transition-all font-bold text-lg text-foreground appearance-none cursor-pointer"
                            >
                              <option value="" disabled className="bg-surface text-muted">
                                {getLocalizedValue(field.placeholder) ||
                                  "Select an option"}
                              </option>
                              {(field.options || []).map(
                                (option: any, index: number) => {
                                  const val =
                                    typeof option === "object"
                                      ? option.value
                                      : option;
                                  const label =
                                    typeof option === "object"
                                      ? getLocalizedValue(option.label)
                                      : option;
                                  return (
                                    <option
                                      key={index}
                                      value={val}
                                      className="bg-surface text-foreground font-medium"
                                    >
                                      {label}
                                    </option>
                                  );
                                },
                              )}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center gap-4 py-2">
                            <input
                              type="checkbox"
                              required={field.required}
                              name={fieldKey}
                              checked={!!formData[fieldKey]}
                              onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    [fieldKey]: e.target.checked,
                                  });
                              }}
                              className="w-5 h-5 rounded-md border-2 border-border/80 text-secondary focus:ring-secondary focus:ring-offset-background transition-all cursor-pointer bg-surface/50"
                            />
                            <span className="text-sm font-medium text-muted-foreground select-none cursor-pointer">
                              {getLocalizedValue(field.placeholder) || "I agree"}
                            </span>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type={field.type}
                              required={field.required}
                              name={fieldKey}
                              value={formData[fieldKey] || ""}
                              onChange={handleChange}
                              placeholder={getLocalizedValue(field.placeholder)}
                              className="w-full bg-surface/40 backdrop-blur-sm border border-border/60 hover:border-border/80 focus:border-secondary focus:ring-1 focus:ring-secondary/50 rounded-2xl px-5 py-4 outline-none transition-all font-bold text-lg text-foreground placeholder:text-muted/60 placeholder:font-medium"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-foreground text-background h-16 rounded-[20px] text-[15px] font-bold uppercase tracking-[2px] flex items-center justify-between px-8 group hover:shadow-xl transition-all duration-500 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    <span className="relative z-10 flex gap-2 items-center group-hover:text-white transition-colors duration-500">
                      <EditableText
                        value={submitButtonText}
                        currentPages={currentPages}
                        sectionId={formSection?.id}
                        fieldPath="props.submitButtonText"
                      />
                    </span>
                    <div className="relative z-10 w-10 h-10 rounded-full bg-background/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all duration-500 group-hover:translate-x-1">
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin group-hover:border-white/20 group-hover:border-t-white" />
                      ) : (
                        <ArrowRight size={18} />
                      )}
                    </div>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
    </div>
  );
};
