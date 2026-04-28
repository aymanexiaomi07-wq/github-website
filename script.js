// ==================== STATE CENTRALISÉ ====================
const state = {
    currentUser: null,    
    bookmarks: [],        
    isViewingBookmarks: false  
};



const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const welcomeState = document.getElementById('welcomeState');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const bookmarksSection = document.getElementById('bookmarksSection');
const bookmarksNavBtn = document.getElementById('bookmarksNavBtn');
const closeBookmarksBtn = document.getElementById('closeBookmarksBtn');
const bookmarkCountSpan = document.getElementById('bookmarkCountNav');
const userProfileDiv = document.getElementById('userProfile');
const reposListDiv = document.getElementById('reposList');
const reposCountSpan = document.getElementById('reposCount');
const bookmarksListDiv = document.getElementById('bookmarksList');
const errorRetryBtn = document.getElementById('errorRetryBtn');




