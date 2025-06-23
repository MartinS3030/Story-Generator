const LOGIN_STRINGS = {
  PAGE_TITLE: 'Login',
  LOGIN_HEADING: 'Sign In',
  EMAIL_LABEL: 'Email',
  PASSWORD_LABEL: 'Password',
  LOGIN_BUTTON: 'Log In',
  NO_ACCOUNT_MESSAGE: "Don't have an account?",
  SIGNUP_LINK: 'Sign up',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
  PAGE_TITLE: 'Story Generator',
  QUOTE: '“A mind needs books as a sword needs a whetstone if it is to keep its edge.”',
  QUOTE_AUTHOR: '– Tyrion Lannister, A Game of Thrones by George R.R. Martin',
};

const SIGNUP_STRINGS = {
  SIGNUP_PAGE_TITLE: 'Sign Up',
  SIGNUP_HEADING: 'Create Account',
  LABEL_FIRST_NAME: 'First Name',
  LABEL_EMAIL: 'Email',
  LABEL_PASSWORD: 'Password',
  BUTTON_SIGNUP: 'Sign Up',
  ACCOUNT_EXISTS: 'Already have an account?',
  LOGIN_LINK_TEXT: 'Sign in',
  SIGNUP_SUCCESS: 'Account created successfully! Please sign in.',
  SIGNUP_FAILED: 'Signup failed. Please try again.',
  SIGNUP_ERROR: 'An error occurred during signup. Please try again.'
};

const USER_STRINGS = {
  pageTitle: "Story Generator",
  loading: "Generating your story...",
  storyConfigurationTitle: "Story Configuration",
  generating: "Generating...",
  saving: "Saving...",
  saveStory: "Save Story",
  createNewStory: "Create New Story",
  storyGeneratedTitle: "Your Generated Story",
  storySavedSuccess: "Story saved successfully!",
  storySaveError: "Error saving story: ",
  storySaveFailed: "Failed to save story",
  genre: {
    label: "Genre",
    placeholder: "Select a genre",
    options: {
      fantasy: "Fantasy",
      scifi: "Science Fiction",
      mystery: "Mystery",
      romance: "Romance",
      horror: "Horror",
      adventure: "Adventure",
      comedy: "Comedy",
      drama: "Drama"
    }
  },
  characterName: {
    label: "Main Character Name",
    pattern: "[A-Za-z\\s]+",
    title: "Only letters and spaces allowed",
    maxLength: 50
  },
  role: {
    label: "Character Role",
    placeholder: "Select a role",
    options: {
      hero: "Hero",
      villain: "Villain",
      detective: "Detective",
      scientist: "Scientist",
      warrior: "Warrior",
      mage: "Mage",
      explorer: "Explorer",
      merchant: "Merchant"
    }
  },
  setting: {
    label: "Setting",
    placeholder: "Select a setting",
    options: {
      medieval: "Medieval Kingdom",
      futuristic: "Futuristic City",
      haunted: "Haunted House",
      space: "Space Station",
      forest: "Enchanted Forest",
      desert: "Desert Wasteland",
      underwater: "Underwater City",
      mountain: "Mountain Village"
    }
  },
  tone: {
    label: "Tone",
    placeholder: "Select a tone",
    options: {
      dark: "Dark",
      light: "Light-hearted",
      serious: "Serious",
      humorous: "Humorous",
      mysterious: "Mysterious",
      romantic: "Romantic",
      action: "Action-packed",
      contemplative: "Contemplative"
    }
  },
  plotTwist: {
    label: "Plot Twist",
    checkboxLabel: "Add an unexpected plot twist"
  },
  generateButton: "Generate Story",
  errors: {
    storyGeneration: "Failed to generate story",
    generic: "An error occurred: "
  },
  alerts: {
    noApiCalls: "You have no API calls remaining. Please upgrade your plan."
  }
};

const NAVBAR_STRINGS = {
  API_CALLS_LEFT: "API calls left: ",
  HELLO_USER: "Hello, ",
  CHANGE_USERNAME: "Change Username",
  LOGOUT: "Logout",
  MODAL_TITLE: "Change Username",
  NEW_USERNAME_LABEL: "New Username:",
  CANCEL_BUTTON: "Cancel",
  SUBMIT_BUTTON: "Submit",
  LOGOUT_FAILED: "Logout failed. Please try again.",
  LOGOUT_ERROR: "An error occurred during logout.",
  EMPTY_USERNAME_ERROR: "Please enter a username.",
  UPDATE_SUCCESS: "Username updated successfully!",
  UPDATE_ERROR: "An error occurred while updating username."
};

const ADMIN_STRINGS = {
  LOGOUT_BUTTON: 'Logout',
  LOGOUT_FAILED: 'Logout failed. Please try again.',
  LOGOUT_ERROR: 'An error occurred during logout.',
  DELETE_USER_CONFIRMATION: (username) => `Are you sure you want to delete user "${username}"?`,
  DELETE_USER_ERROR: 'An error occurred while deleting the user.',
  USER_MANAGEMENT_TITLE: 'User Management',
  RESOURCE_MANAGEMENT_TITLE: 'Resource Usage',
  USER_TABLE_HEADERS: ['Username', 'Email', 'Admin', 'API Calls', 'Actions'],
  RESOURCE_TABLE_HEADERS: ['Method', 'Endpoint', 'Requests'],
  NO_USERS_FOUND: 'No users found',
  NO_RESOURCES_FOUND: 'No resources found',
  ADMIN_STATUS: { YES: 'Yes', NO: 'No' },
  DELETE_BUTTON: 'Delete',
  RESOURCE_FETCH_ERROR: 'Failed to fetch resource data'
};

const SAVED_STORIES_STRINGS = {
  PAGE_TITLE: "Your Saved Stories",
  LOADING_MESSAGE: "Loading your stories...",

  NO_STORIES_TITLE: "No Stories Yet",
  NO_STORIES_MESSAGE: "You haven't saved any stories yet. Start creating your first story!",
  CREATE_FIRST_STORY_BUTTON: "Create Your First Story",

  SEARCH_LABEL: "Search Stories",
  SEARCH_PLACEHOLDER: "Search by story title...",
  FILTER_BY_TAGS_LABEL: "Filter by Tags",
  NO_TAGS_AVAILABLE: "No tags available",
  DATE_RANGE_LABEL: "Date Range",
  DATE_FROM_LABEL: "From",
  DATE_TO_LABEL: "To",
  SORT_BY_LABEL: "Sort By",
  SORT_OPTIONS: {
    NEWEST: "Newest First",
    OLDEST: "Oldest First",
    ALPHABETICAL: "Alphabetical (A-Z)"
  },

  SHOWING_RESULTS: (filtered, total) => `Showing ${filtered} of ${total} stories`,
  CLEAR_ALL_FILTERS: "Clear All Filters",
  NO_RESULTS_TITLE: "No Stories Found",
  NO_RESULTS_MESSAGE: "No stories match your current filters.",
  CLEAR_FILTERS_SUGGESTION: "Clear filters to see all stories",

  SHOW_LESS: "Show Less",
  READ_MORE: "Read More",
  ADD_TO_FAVORITES: "Add to favorites",
  REMOVE_FROM_FAVORITES: "Remove from favorites",
  DELETE_STORY: "Delete story",
  CONFIRM_DELETE: "Click again to confirm deletion",

  DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete this story? This action cannot be undone.",
  DELETE_CONFIRM_BUTTON: "Yes, Delete",
  DELETE_CANCEL_BUTTON: "Cancel",
  DELETING: "Deleting...",

  STORY_DELETED_SUCCESS: "Story deleted successfully",
  FAVORITE_ADDED: "added to",
  FAVORITE_REMOVED: "removed from",
  FAVORITES_TEXT: "favorites",

  FAILED_TO_FETCH: "Failed to fetch stories",
  FAILED_TO_DELETE: "Failed to delete story:",
  FAILED_TO_UPDATE_FAVORITE: "Failed to update favorite status:",
  
  CREATE_NEW_STORY_BUTTON: "Create New Story",
  
  CONSOLE: {
    STORY_DELETED: "Story deleted successfully",
    FAVORITE_UPDATED: (action) => `Story ${action} favorites`,
    ERROR_FETCHING: "Error fetching stories:",
    ERROR_DELETING: "Error deleting story:",
    ERROR_FAVORITE: "Error updating favorite status:"
  }
};

export {
    LOGIN_STRINGS,
    SIGNUP_STRINGS,
    USER_STRINGS,
    NAVBAR_STRINGS,
    ADMIN_STRINGS,
    SAVED_STORIES_STRINGS,
}