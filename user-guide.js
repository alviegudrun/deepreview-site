/**
 * DeepReview User Guide JavaScript
 * Handles navigation, content loading, search, and theme switching
 */

class UserGuideApp {
  constructor() {
    this.currentLang = this.getLanguageFromURL() || 'en';
    this.currentSection = this.getSectionFromURL() || 'scenarios';
    this.guideData = null;
    this.sections = [];
    this.searchIndex = [];
    
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadGuideData();
    this.renderNavigation();
    this.showSection(this.currentSection);
    this.updateLanguageToggle();
    this.setupSearch();
    this.updateLastUpdated();
  }

  getLanguageFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || 'en';
  }

  getSectionFromURL() {
    const hash = window.location.hash.replace('#', '');
    return hash || 'scenarios';
  }

  updateURL(section) {
    const url = new URL(window.location);
    url.hash = section;
    url.searchParams.set('lang', this.currentLang);
    window.history.replaceState({}, '', url);
  }

  async loadGuideData() {
    try {
      const response = await fetch('../USER_GUIDE_EN.md');
      const enContent = await response.text();
      
      const zhResponse = await fetch('../USER_GUIDE_ZH.md');
      const zhContent = await zhResponse.text();
      
      this.guideData = {
        en: this.parseMarkdown(enContent),
        zh: this.parseMarkdown(zhContent)
      };
      
      this.buildSearchIndex();
    } catch (error) {
      console.error('Failed to load guide data:', error);
      this.showError();
    }
  }

  parseMarkdown(content) {
    const sections = {};
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];
    
    for (const line of lines) {
      if (line.startsWith('## 🎯') || line.startsWith('## 🔗') || line.startsWith('## ⚙️') || 
          line.startsWith('## 🚀') || line.startsWith('## 🔒') || line.startsWith('## 💎') || 
          line.startsWith('## 📞')) {
        
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = {
            title: currentContent[0].replace(/^## /, ''),
            content: currentContent.join('\n')
          };
        }
        
        if (line.includes('应用场景') || line.includes('Application Scenarios')) {
          currentSection = 'scenarios';
        } else if (line.includes('AI供应商') || line.includes('AI Provider')) {
          currentSection = 'providers';
        } else if (line.includes('基础功能') || line.includes('Basic Functions')) {
          currentSection = 'basic';
        } else if (line.includes('高级功能') || line.includes('Advanced Features')) {
          currentSection = 'advanced';
        } else if (line.includes('隐私与安全') || line.includes('Privacy & Security')) {
          currentSection = 'privacy';
        } else if (line.includes('订阅政策') || line.includes('Subscription Policy')) {
          currentSection = 'subscription';
        } else if (line.includes('支持与反馈') || line.includes('Support & Feedback')) {
          currentSection = 'support';
        }
        
        currentContent = [line];
      } else {
        if (currentSection) {
          currentContent.push(line);
        }
      }
    }
    
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = {
        title: currentContent[0].replace(/^## /, ''),
        content: currentContent.join('\n')
      };
    }
    
    return sections;
  }

  renderNavigation() {
    const nav = document.getElementById('guideNav');
    const data = this.guideData[this.currentLang];
    
    if (!data) return;
    
    const navSections = [
      { key: 'scenarios', icon: '🎯', title: this.currentLang === 'zh' ? '应用场景' : 'Application Scenarios' },
      { key: 'providers', icon: '🔗', title: this.currentLang === 'zh' ? 'AI供应商配置' : 'AI Provider Setup' },
      { key: 'basic', icon: '⚙️', title: this.currentLang === 'zh' ? '基础功能' : 'Basic Functions' },
      { key: 'advanced', icon: '🚀', title: this.currentLang === 'zh' ? '高级功能' : 'Advanced Features' },
      { key: 'privacy', icon: '🔒', title: this.currentLang === 'zh' ? '隐私与安全' : 'Privacy & Security' },
      { key: 'subscription', icon: '💎', title: this.currentLang === 'zh' ? '订阅政策' : 'Subscription Policy' },
      { key: 'support', icon: '📞', title: this.currentLang === 'zh' ? '支持与反馈' : 'Support & Feedback' }
    ];
    
    nav.innerHTML = navSections.map(section => `
      <div class="nav-section">
        <div class="nav-section-title" data-section="${section.key}">
          <span class="section-icon">${section.icon}</span>
          <span class="section-title">${section.title}</span>
        </div>
      </div>
    `).join('');
    
    this.sections = navSections;
  }

  showSection(sectionKey) {
    // Update navigation
    document.querySelectorAll('.nav-section-title').forEach(el => {
      el.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`[data-section="${sectionKey}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }
    
    // Update content
    const data = this.guideData[this.currentLang];
    if (!data || !data[sectionKey]) {
      this.showError();
      return;
    }
    
    const content = data[sectionKey];
    const article = document.getElementById('guideArticle');
    article.innerHTML = this.markdownToHtml(content.content);
    
    // Update breadcrumb
    const section = this.sections.find(s => s.key === sectionKey);
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = `
      <span class="breadcrumb-item">User Guide</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item current">${section ? section.title : sectionKey}</span>
    `;
    
    // Update pagination
    this.updatePagination(sectionKey);
    
    // Update URL
    this.currentSection = sectionKey;
    this.updateURL(sectionKey);
    
    // Scroll to top
    document.querySelector('.guide-content').scrollTop = 0;
  }

  updatePagination(currentKey) {
    const currentIndex = this.sections.findIndex(s => s.key === currentKey);
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentIndex > 0) {
      const prevSection = this.sections[currentIndex - 1];
      prevBtn.disabled = false;
      prevBtn.innerHTML = `<span>←</span> ${prevSection.title}`;
      prevBtn.onclick = () => this.showSection(prevSection.key);
    } else {
      prevBtn.disabled = true;
      prevBtn.innerHTML = '<span>←</span> Previous';
      prevBtn.onclick = null;
    }
    
    if (currentIndex < this.sections.length - 1) {
      const nextSection = this.sections[currentIndex + 1];
      nextBtn.disabled = false;
      nextBtn.innerHTML = `${nextSection.title} <span>→</span>`;
      nextBtn.onclick = () => this.showSection(nextSection.key);
    } else {
      nextBtn.disabled = true;
      nextBtn.innerHTML = 'Next <span>→</span>';
      nextBtn.onclick = null;
    }
  }

  markdownToHtml(markdown) {
    return markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      
      // Code blocks
      .replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Lists
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, (match) => {
        const items = match.match(/<li>.*?<\/li>/g);
        return '<ul>' + items.join('') + '</ul>';
      })
      
      // Tables
      .replace(/\|([^|]+\|[^|]+(\|[^|]*)*)\|/g, (match) => {
        const rows = match.split('\n').filter(row => row.trim() && row.includes('|'));
        if (rows.length < 2) return match;
        
        let table = '<table><thead><tr>';
        const headers = rows[0].split('|').slice(1, -1);
        headers.forEach(header => {
          table += `<th>${header.trim()}</th>`;
        });
        table += '</tr></thead><tbody>';
        
        // Skip separator row
        for (let i = 2; i < rows.length; i++) {
          const cells = rows[i].split('|').slice(1, -1);
          table += '<tr>';
          cells.forEach(cell => {
            table += `<td>${cell.trim()}</td>`;
          });
          table += '</tr>';
        }
        
        table += '</tbody></table>';
        return table;
      })
      
      // Paragraphs
      .split('\n\n')
      .map(paragraph => {
        paragraph = paragraph.trim();
        if (!paragraph) return '';
        if (paragraph.startsWith('<')) return paragraph;
        return `<p>${paragraph}</p>`;
      })
      .join('\n')
      
      // Clean up
      .replace(/<p><\/p>/g, '')
      .replace(/\n+/g, '\n');
  }

  buildSearchIndex() {
    this.searchIndex = [];
    
    ['en', 'zh'].forEach(lang => {
      const data = this.guideData[lang];
      Object.keys(data).forEach(sectionKey => {
        const section = data[sectionKey];
        const plainText = section.content
          .replace(/[#*`\[\]()]/g, '')
          .replace(/\n+/g, ' ')
          .toLowerCase();
        
        this.searchIndex.push({
          lang,
          section: sectionKey,
          title: section.title,
          content: plainText
        });
      });
    });
  }

  setupSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300);
    });
  }

  performSearch(query) {
    if (!query.trim()) {
      this.clearSearchHighlight();
      return;
    }
    
    const results = this.searchIndex
      .filter(item => item.lang === this.currentLang)
      .filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.includes(query.toLowerCase())
      )
      .slice(0, 5);
    
    if (results.length > 0) {
      // Highlight matching sections in navigation
      document.querySelectorAll('.nav-section-title').forEach(el => {
        el.classList.remove('search-match');
      });
      
      results.forEach(result => {
        const navItem = document.querySelector(`[data-section="${result.section}"]`);
        if (navItem) {
          navItem.classList.add('search-match');
        }
      });
    }
  }

  clearSearchHighlight() {
    document.querySelectorAll('.nav-section-title').forEach(el => {
      el.classList.remove('search-match');
    });
  }

  updateLanguageToggle() {
    const langText = document.getElementById('langText');
    const langIcon = document.getElementById('langIcon');
    
    if (this.currentLang === 'en') {
      langText.textContent = '中文';
      langIcon.textContent = '🌐';
    } else {
      langText.textContent = 'English';
      langIcon.textContent = '🌐';
    }
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'zh' : 'en';
    this.updateLanguageToggle();
    this.renderNavigation();
    this.showSection(this.currentSection);
    this.updateURL(this.currentSection);
  }

  toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeIcon = document.getElementById('themeIcon');
    const isDark = document.body.classList.contains('dark-theme');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    
    // Save theme preference
    localStorage.setItem('user-guide-theme', isDark ? 'dark' : 'light');
  }

  loadThemePreference() {
    const savedTheme = localStorage.getItem('user-guide-theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.getElementById('themeIcon').textContent = '☀️';
    }
  }

  updateLastUpdated() {
    const lastUpdated = document.getElementById('lastUpdated');
    const date = new Date().toLocaleDateString(this.currentLang === 'zh' ? 'zh-CN' : 'en-US');
    lastUpdated.textContent = date;
  }

  showError() {
    const article = document.getElementById('guideArticle');
    article.innerHTML = `
      <div class="error-state">
        <h2>⚠️ Loading Error</h2>
        <p>Unable to load the user guide content. Please try refreshing the page.</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
  }

  bindEvents() {
    // Load theme preference
    this.loadThemePreference();
    
    // Navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.nav-section-title')) {
        const section = e.target.closest('.nav-section-title').dataset.section;
        if (section) {
          this.showSection(section);
        }
      }
    });
    
    // Language toggle
    document.getElementById('langToggle').addEventListener('click', () => {
      this.switchLanguage();
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Print
    document.getElementById('printBtn').addEventListener('click', () => {
      window.print();
    });
    
    // Share
    document.getElementById('shareBtn').addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'DeepReview User Guide',
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Link copied to clipboard!');
        });
      }
    });
    
    // Mobile menu (if needed)
    this.setupMobileMenu();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.getElementById('searchInput').focus();
            break;
          case 'p':
            e.preventDefault();
            window.print();
            break;
        }
      }
    });
  }

  setupMobileMenu() {
    // Add mobile menu toggle if on mobile
    if (window.innerWidth <= 768) {
      const mobileToggle = document.createElement('button');
      mobileToggle.className = 'mobile-menu-toggle';
      mobileToggle.innerHTML = '☰';
      mobileToggle.onclick = () => {
        document.querySelector('.guide-sidebar').classList.toggle('open');
      };
      document.body.appendChild(mobileToggle);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.guide-sidebar');
      const toggle = document.querySelector('.mobile-menu-toggle');
      
      if (!sidebar.contains(e.target) && e.target !== toggle) {
        sidebar.classList.remove('open');
      }
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UserGuideApp();
});

// Add search highlight styles
const style = document.createElement('style');
style.textContent = `
  .nav-section-title.search-match {
    background: rgba(106, 161, 255, 0.2) !important;
    border-left: 3px solid var(--brand);
  }
  
  .error-state {
    text-align: center;
    padding: 60px 20px;
  }
  
  .error-state h2 {
    color: var(--warn);
    margin-bottom: 16px;
  }
`;
document.head.appendChild(style); 