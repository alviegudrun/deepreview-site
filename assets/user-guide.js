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
      // 由于浏览器安全限制，我们需要将 markdown 内容嵌入到 JavaScript 中
      // 或者使用服务器端点来提供内容
      
      // 临时解决方案：显示静态内容
      this.guideData = {
        en: this.getStaticEnContent(),
        zh: this.getStaticZhContent()
      };
      
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

  getStaticEnContent() {
    return {
      scenarios: {
        title: '🎯 Application Scenarios',
        content: `## 🎯 Application Scenarios

DeepReview is a highly flexible AI-powered review tool that supports both predefined and custom rules. Here are the main application scenarios:

### 1. Code Quality Review

**Use Case**: Identify bugs, security vulnerabilities, performance issues, and style problems in your codebase.

**Example**: 
\`\`\`javascript
// Before Review
function getUserData(id) {
    return fetch('/api/user/' + id).then(res => res.json())
}

// After AI Review identifies issues:
// 1. Missing error handling
// 2. No input validation
// 3. Potential SQL injection risk
\`\`\`

**Recommended Rules**: 
- General Code Rules
- Language-specific rules (JavaScript, Python, Java, etc.)
- Security & Performance Rules

### 2. Document Quality Review

**Use Case**: Check technical documentation, API docs, user manuals for consistency, clarity, and completeness.

### 3. Content Writing Review

**Use Case**: Improve marketing content, blog posts, and user-facing documentation for clarity and engagement.

### 4. Academic Paper Review

**Use Case**: Check research papers, thesis documents, and academic writing for structure and clarity.`
      },
      providers: {
        title: '🔗 AI Provider Setup',
        content: `## 🔗 AI Provider Setup

DeepReview supports multiple AI providers. Configure your preferred provider in the extension settings.

### Supported Providers

1. **OpenAI** (GPT-3.5, GPT-4)
2. **Claude** (Anthropic)
3. **Gemini** (Google)
4. **Custom API** endpoints

### Configuration Steps

1. Open DeepReview settings
2. Select your AI provider
3. Enter your API key
4. Test the connection
5. Save settings

### API Key Security

Your API keys are stored locally and never transmitted to our servers.`
      },
      basic: {
        title: '⚙️ Basic Functions',
        content: `## ⚙️ Basic Functions

### Quick Review

1. Select text or files to review
2. Choose a predefined rule set
3. Click "Start Review"
4. View AI feedback and suggestions

### Predefined Rules

DeepReview comes with comprehensive rule sets for:
- Code review (multiple languages)
- Document review
- Content writing
- Academic writing`
      },
      advanced: {
        title: '🚀 Advanced Features',
        content: `## 🚀 Advanced Features

### Custom Rules

Create your own review rules:
1. Go to Custom Rules section
2. Define your criteria
3. Save and apply to reviews

### Batch Processing

Review multiple files simultaneously with consistent rules.

### Integration

- Git integration for commit reviews
- IDE extensions
- CI/CD pipeline integration`
      },
      privacy: {
        title: '🔒 Privacy & Security',
        content: `## 🔒 Privacy & Security

### Data Privacy

- All processing happens locally or through your chosen AI provider
- No data stored on our servers
- API keys encrypted locally

### Security Features

- Secure API key storage
- Local processing options
- No data transmission to third parties`
      },
      subscription: {
        title: '💎 Subscription Policy',
        content: `## 💎 Subscription Policy

### Free Tier

- Limited daily reviews
- Basic rule sets
- Standard AI models

### Pro Tier

- Unlimited reviews
- Advanced rule sets
- Premium AI models
- Priority support

### Enterprise

- Custom deployment
- Team management
- Advanced integrations
- Dedicated support`
      },
      support: {
        title: '📞 Support & Feedback',
        content: `## 📞 Support & Feedback

### Getting Help

- Email: support@deepreview.cloud
- Documentation: Available in the extension
- Community: GitHub discussions

### Feedback

We value your feedback! Help us improve DeepReview by sharing your experience and suggestions.`
      }
    };
  }

  getStaticZhContent() {
    return {
      scenarios: {
        title: '🎯 应用场景',
        content: `## 🎯 应用场景

DeepReview 是一个高度灵活的 AI 驱动的审查工具，支持预定义和自定义规则。主要应用场景包括：

### 1. 代码质量审查

**使用场景**：识别代码中的错误、安全漏洞、性能问题和风格问题。

**示例**：
\`\`\`javascript
// 审查前
function getUserData(id) {
    return fetch('/api/user/' + id).then(res => res.json())
}

// AI 审查后识别的问题：
// 1. 缺少错误处理
// 2. 没有输入验证
// 3. 潜在的 SQL 注入风险
\`\`\`

**推荐规则**：
- 通用代码规则
- 特定语言规则（JavaScript、Python、Java 等）
- 安全与性能规则

### 2. 文档质量审查

**使用场景**：检查技术文档、API 文档、用户手册的一致性、清晰度和完整性。

### 3. 内容写作审查

**使用场景**：改进营销内容、博客文章和面向用户的文档的清晰度和吸引力。

### 4. 学术论文审查

**使用场景**：检查研究论文、学位论文和学术写作的结构和清晰度。`
      },
      providers: {
        title: '🔗 AI 供应商配置',
        content: `## 🔗 AI 供应商配置

DeepReview 支持多个 AI 供应商。在扩展设置中配置您首选的供应商。

### 支持的供应商

1. **OpenAI** (GPT-3.5, GPT-4)
2. **Claude** (Anthropic)
3. **Gemini** (Google)
4. **自定义 API** 端点

### 配置步骤

1. 打开 DeepReview 设置
2. 选择您的 AI 供应商
3. 输入您的 API 密钥
4. 测试连接
5. 保存设置

### API 密钥安全

您的 API 密钥本地存储，永远不会传输到我们的服务器。`
      },
      basic: {
        title: '⚙️ 基础功能',
        content: `## ⚙️ 基础功能

### 快速审查

1. 选择要审查的文本或文件
2. 选择预定义规则集
3. 点击"开始审查"
4. 查看 AI 反馈和建议

### 预定义规则

DeepReview 提供全面的规则集：
- 代码审查（多种语言）
- 文档审查
- 内容写作
- 学术写作`
      },
      advanced: {
        title: '🚀 高级功能',
        content: `## 🚀 高级功能

### 自定义规则

创建您自己的审查规则：
1. 进入自定义规则部分
2. 定义您的标准
3. 保存并应用到审查中

### 批量处理

使用一致的规则同时审查多个文件。

### 集成

- Git 集成进行提交审查
- IDE 扩展
- CI/CD 管道集成`
      },
      privacy: {
        title: '🔒 隐私与安全',
        content: `## 🔒 隐私与安全

### 数据隐私

- 所有处理都在本地或通过您选择的 AI 供应商进行
- 我们的服务器不存储任何数据
- API 密钥在本地加密

### 安全功能

- 安全的 API 密钥存储
- 本地处理选项
- 不向第三方传输数据`
      },
      subscription: {
        title: '💎 订阅政策',
        content: `## 💎 订阅政策

### 免费套餐

- 每日有限审查次数
- 基础规则集
- 标准 AI 模型

### 专业套餐

- 无限审查
- 高级规则集
- 优质 AI 模型
- 优先支持

### 企业套餐

- 自定义部署
- 团队管理
- 高级集成
- 专属支持`
      },
      support: {
        title: '📞 支持与反馈',
        content: `## 📞 支持与反馈

### 获取帮助

- 邮箱：support@deepreview.cloud
- 文档：在扩展中提供
- 社区：GitHub 讨论

### 反馈

我们重视您的反馈！通过分享您的体验和建议来帮助我们改进 DeepReview。`
      }
    };
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

// Add additional styles
const style = document.createElement('style');
style.textContent = `
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
