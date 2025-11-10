
export interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  options?: string[];
  isPhotoRequest?: boolean;
  isFinalReport?: boolean;
  isTextInputRequest?: boolean;
  textInputPlaceholder?: string;
  isMultiChoice?: boolean;
  isTextInputWithNone?: boolean;
  userUploadedImageUrls?: string[]; // Added for final report image display
  isComboInputRequest?: boolean; // New: for combined year/month input
  isAgeDropdownRequest?: boolean; // New: for age dropdown input
  ageDropdownMin?: number; // New: min age for dropdown
  ageDropdownMax?: number; // New: max age for dropdown
  hasNoneButton?: boolean; // New: indicates if a dedicated "None" button should be shown
  noneButtonText?: string; // New: text for the dedicated "None" button
  // isQuestionForVideoAnalysis?: boolean; // Removed: indicates if AI is asking a question about an uploaded video
}

// Type for the history sent to Gemini API
export interface GeminiContent {
  role: 'user' | 'model';
  parts: (GeminiTextPart | GeminiImagePart)[]; // Removed GeminiVideoPart
}

export interface GeminiTextPart {
    text: string;
}

export interface GeminiImagePart {
    inlineData: {
        mimeType: string;
        data: string;
    };
}

// New interface for selected file previews in FileUpload component
export interface SelectedFilePreview {
  file: File;
  url: string; // Object URL for preview
  id: string; // Unique ID for keying/removal
  type: 'image'; // Now always 'image'
}

// Removed: Interface for video content
/*
export interface GeminiVideoPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}
*/

// New interfaces for structured content in PageConfig
export interface GenericIconTextItem {
  title: string;
  text: string;
  icon: string;
}

export interface ArticleItem {
  title: string;
  excerpt: string;
  tag: string;
  date?: string;
}

export interface DictionaryTerm {
  term: string;
  definition: string;
}

// Config types
export interface AppConfig {
  app: {
    name: string;
    description: string;
    theme: {
      primaryColor: string;
      background: string;
      card: string;
      accent: string;
      radius: number;
      font: string;
    };
    layout: {
      header: {
        logoText: string;
        subtitle: string;
        nav: { id: string; label: string }[];
      };
      hero: {
        title: string;
        subtitle: string;
        cta: { label: string; target: string };
        illustration: { type: string; prompt: string };
        badges: string[];
      };
    };
    pages: PageConfig[];
    uiGuidelines: {
      cardsRounded: boolean;
      shadows: string;
      showProgressOnQuestionnaire: boolean;
      useMedicalIcons: boolean;
      tone: string;
      showDisclaimerAtTop: boolean;
    };
  };
}

export interface PageConfig {
  id: string;
  title: string;
  description?: string;
  sections?: {
    type: string;
    title?: string;
    text?: string;
    // Updated to allow for different types of items based on section content
    items?: GenericIconTextItem[] | ArticleItem[]; 
    style?: string;
    // Updated to use the new DictionaryTerm interface
    dictionaryTerms?: DictionaryTerm[]; 
  }[];
  steps?: QuestionnaireStep[];
  finalScreen?: {
    title: string;
    text: string;
    disclaimer: string;
  };
  autoUpdate?: {
    everyDays: number;
    placeholderArticle: {
      title: string;
      excerpt: string;
      tag: string;
    };
  };
  fields?: { name: string; label: string; type: string; required: boolean }[];
}

export interface QuestionnaireStep {
  id: string;
  label: string;
  question: string;
  type: 'multi_choice' | 'single_choice' | 'text' | 'text_area' | 'text_with_none' | 'photo_request' | 'combo_input' | 'age_dropdown'; // New 'age_dropdown' type
  options?: string[];
  onOther?: { type: string; placeholder: string };
  illustration?: { type: string; prompt: string };
  placeholder?: string;
  helper?: string;
}