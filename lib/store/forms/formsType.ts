// export interface FormField {
//   id: string;
//   type: "text" | "number" | "textarea" | "select" | "checkbox";
//   label: string;
//   name?: string;
//   placeholder?: string;
//   required: boolean;
//   options?: string[]; // For select type
// }

// export interface FormsData {
//   id?:string;
//   name?: string;
//   fields?: FormField[];
// }

export interface FormField {
  id: string;
  type: FieldType;
  /** Internal key used when the form is submitted, e.g. "first_name".
   *  Also becomes the mail-tag [first_name] in the email template. */
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  /** Small hint rendered under the input */
  helperText?: string;
  /** Only for select / radio fields */
  options?: string[];
}

export interface FormsData {
  id?: string;
  _id?: string;
  name?: string;
  fields?: FormField[];
  settings?: FormSettings;
}

export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "url"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "terms";

export interface EmailTemplate {
  /** Recipient(s), comma separated */
  to: string;
  /** e.g. "[full_name] <noreply@yoursite.com>" */
  from: string;
  /** e.g. 'New enquiry from [full_name]' — mail-tags allowed */
  subject: string;
  /** e.g. "Reply-To: [email]" */
  replyTo: string;
  /** Message body — mail-tags allowed, [all_fields] dumps everything */
  body: string;
}

export interface FormSettings {
  /** When true, an email is sent on every submission using `email` template */
  sendEmail: boolean;
  email: EmailTemplate;
  /** Message shown to the visitor after submitting */
  successMessage: string;
}

export interface FormDataItem {
  id?: string;
  _id?: string;
  formId: string;
  data: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSubmit {
  id?: string;
  formId: string;
  data: Record<string, any>;
}
