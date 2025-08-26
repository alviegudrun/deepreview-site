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
    let html = markdown;
    
      // Headers (order matters - start with most specific)
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
      
      // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
      
    // Code blocks (before inline code)
    html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Tables (process before other paragraph splitting)
    html = html.replace(/(\|[^|\n]+\|[^\n]*\n\|[-|:\s]+\|[^\n]*\n(\|[^|\n]+\|[^\n]*\n?)*)/g, (match) => {
      const rows = match.trim().split('\n').filter(row => row.trim() && row.includes('|'));
        if (rows.length < 2) return match;
        
        let table = '<table><thead><tr>';
        const headers = rows[0].split('|').slice(1, -1);
        headers.forEach(header => {
          table += `<th>${header.trim()}</th>`;
        });
        table += '</tr></thead><tbody>';
        
      // Skip separator row (index 1)
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
    });
    
    // Process content by sections to handle lists properly
    const sections = html.split(/\n\n+/);
    const processedSections = sections.map(section => {
      section = section.trim();
      if (!section) return '';
      
      // Skip already processed HTML elements
      if (section.startsWith('<')) return section;
      
      // Handle lists
      if (section.includes('\n- ')) {
        const lines = section.split('\n');
        let listHtml = '';
        let inList = false;
        
        for (const line of lines) {
          if (line.trim().startsWith('- ')) {
            if (!inList) {
              listHtml += '<ul>';
              inList = true;
            }
            listHtml += `<li>${line.trim().substring(2)}</li>`;
          } else if (inList) {
            listHtml += '</ul>';
            inList = false;
            if (line.trim()) {
              listHtml += `<p>${line.trim()}</p>`;
            }
          } else if (line.trim()) {
            listHtml += `<p>${line.trim()}</p>`;
          }
        }
        
        if (inList) {
          listHtml += '</ul>';
        }
        
        return listHtml;
      }
      
      // Handle numbered lists with sub-items
      if (/^\d+\./.test(section)) {
        const lines = section.split('\n');
        let result = '';
        let inList = false;
        let listContent = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          if (/^\d+\./.test(trimmed)) {
            if (!inList) {
              result += '<ol>';
              inList = true;
            }
            // Remove the number and dot, keep only the content
            const content = trimmed.replace(/^\d+\.\s*/, '');
            result += `<li>${content}`;
            listContent = []; // Reset sub-content for this list item
          } else if (trimmed.startsWith('- ') && inList) {
            // Handle sub-items within numbered list
            if (listContent.length === 0) {
              result += '<ul>';
            }
            result += `<li>${trimmed.substring(2)}</li>`;
            listContent.push(trimmed);
          } else if (trimmed && inList) {
            // Handle other content within list item
            if (listContent.length > 0) {
              result += '</ul>';
              listContent = [];
            }
            result += `<div>${trimmed}</div>`;
          } else if (trimmed) {
            // Handle content outside of list
            if (inList) {
              if (listContent.length > 0) {
                result += '</ul>';
              }
              result += '</li></ol>';
              inList = false;
              listContent = [];
            }
            result += `<p>${trimmed}</p>`;
          }
        }
        
        // Close any open tags
        if (inList) {
          if (listContent.length > 0) {
            result += '</ul>';
          }
          result += '</li></ol>';
        }
        
        return result;
      }
      
      // Regular paragraph
      return `<p>${section}</p>`;
    });
    
    html = processedSections.join('\n');
      
      // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/\n+/g, '\n');
    html = html.replace(/>\s+</g, '><');
    
    return html;
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

DeepReview is a highly flexible AI-powered review tool that supports both predefined and custom rules. 
- **Error Detection**: Syntax errors, logic errors, potential runtime errors
- **Security Vulnerability Detection**: SQL injection, XSS attacks, authentication issues, etc.
- **Performance Optimization**: Resource leaks, inefficient algorithms, improper data structure usage
- **Code Style**: Naming conventions, comment completeness, code organization structure
- **Technical Documentation**: API docs, user manuals, technical specifications
- **Consistency Checks**: Terminology usage, format uniformity, content completeness
- **Readability Enhancement**: Language clarity, logical structure, example code
- **Code Review**: Automated Pull Request reviews
- **Standardization**: Unified team coding standards

### 💻 Review Workflow

Experience the full functionality of DeepReview through these steps:

#### Step 1: Configure AI Provider
First, configure your AI provider settings and select the appropriate model and API.

<div class="operation-step">
  <img src="./assets/images/step1-settings.png" alt="Configure AI Provider" class="step-image" />
  <p class="step-description">Select your AI provider (such as Deepseek) in the settings interface, configure model parameters and API key. The system will automatically test the connection to ensure proper configuration.</p>
</div>

#### Step 2: Import Files for Review
Import the code files that need to be reviewed into the system.

<div class="operation-step">
  <img src="./assets/images/step2-import-files.png" alt="Import Files" class="step-image" />
  <p class="step-description">Click "Import Files" to import Python files. The system supports multiple programming languages and will automatically identify file types and display code content.</p>
</div>

#### Step 3: Select Review Rules
Choose appropriate predefined rule sets based on your code type.

<div class="operation-step">
  <img src="./assets/images/step3-select-rules.png" alt="Select Rules" class="step-image" />
  <p class="step-description">Click "Import Rules" to select code review rules. The system provides various predefined rule sets including code style, security checks, performance optimization, etc.</p>
</div>

#### Step 4: Start AI Review
Launch the AI review process and wait for analysis completion.

<div class="operation-step">
  <img src="./assets/images/step4-start-review.png" alt="Start Review" class="step-image" />
  <p class="step-description">Click "Start Review" to begin the review process. The system displays a progress bar as AI analyzes each selected rule and generates a detailed review report.</p>
</div>

#### Step 5: View Review Results
Get detailed AI review reports and improvement suggestions.

<div class="operation-step">
  <img src="./assets/images/step5-view-results.png" alt="View Results" class="step-image" />
  <p class="step-description">After review completion, the right panel displays detailed findings and improvement suggestions. Each issue includes specific code locations, problem descriptions, and solutions.</p>
</div>

#### Step 6: Handle Review Suggestions
Make appropriate modifications and optimizations to your code based on AI suggestions.

<div class="operation-step">
  <img src="./assets/images/step6-handle-suggestions.png" alt="Handle Suggestions" class="step-image" />
  <p class="step-description">You can accept, reject, or mark suggestions as pending. The system supports exporting review reports for convenient team collaboration and code improvement tracking.</p>
</div>

`
      },
      providers: {
        title: '🔗 AI Provider Setup',
        content: `## 🔗 AI Provider Setup

DeepReview supports multiple AI providers. Choose the one that best fits your needs and budget.

### 🌟 Supported AI Providers

| Provider | Models | Context Length | Official Website |
|----------|---------|----------------|------------------|
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-4 Turbo, GPT-3.5 Turbo | 4K - 128K tokens | [openai.com](https://openai.com) |
| **Anthropic Claude** | Claude-3.5 Sonnet, Claude-3 Opus, Claude-3 Haiku | 200K tokens | [anthropic.com](https://anthropic.com) |
| **Google Gemini** | Gemini-1.5 Pro, Gemini-1.5 Flash, Gemini Pro | 1M - 2M tokens | [ai.google.dev](https://ai.google.dev) |
| **DeepSeek** | DeepSeek-Chat, DeepSeek-Coder | 32K tokens | [deepseek.com](https://deepseek.com) |
| **Moonshot (Kimi)** | Moonshot-v1-8k, Moonshot-v1-32k, Moonshot-v1-128k | 8K - 200K tokens | [moonshot.cn](https://moonshot.cn) |
| **Alibaba Qwen** | Qwen-Turbo, Qwen-Plus, Qwen-Max | 6K - 30K tokens | [bailian.console.aliyun.com](https://bailian.console.aliyun.com) |
| **Baidu ERNIE** | ERNIE-4.0, ERNIE-3.5, ERNIE-Bot-turbo | 5K - 20K tokens | [cloud.baidu.com](https://cloud.baidu.com) |
| **Tencent Hunyuan** | Hunyuan-Pro, Hunyuan-Standard, Hunyuan-Lite | 32K tokens | [cloud.tencent.com](https://cloud.tencent.com) |
| **ByteDance Doubao** | Doubao-pro-32k, Doubao-lite-4k | 4K - 32K tokens | [volcengine.com](https://volcengine.com) |
| **xAI Grok** | Grok-2, Grok-2-mini | 131K tokens | [x.ai](https://x.ai) |

### 🔧 Configuration Steps

1. Open DeepReview Settings and navigate to the "General" tab
2. Select your AI Provider from the dropdown list of supported providers
3. Enter your API Key and select the specific model you want to use
4. Configure API URL, Context Window, and Output Length settings
5. Click "Test API Connection" to verify your settings
6. Save your configuration - settings are stored locally and encrypted

### 🔐 Security & Privacy

- **Local Storage**: All API keys are stored locally on your device
- **Encryption**: API keys are encrypted before storage
- **No Server Transit**: Your keys never pass through our servers
- **Direct Communication**: DeepReview connects directly to your chosen AI provider

### 🏠 Local Model Deployment

You can also run AI models locally using **Ollama** and connect them to DeepReview.

#### Using Ollama

**Ollama** is the easiest way to run local AI models. It supports popular models like Llama, Mistral, CodeLlama, and Qwen.

**Installation & Setup:**

1. Download and install Ollama from [ollama.ai](https://ollama.ai)
2. Start Ollama service: \`ollama serve\`
3. Download a model: \`ollama pull codellama:13b\`
4. In DeepReview, select "OpenAI Compatible" as AI Provider
5. Set API URL to local url (eg. \`http://localhost:11434/v1/chat/completions\`) 
6. Use any dummy key like \`local-key\` for API Key
7. Enter your model name (e.g., \`codellama:13b\`)
8. Test the connection to verify setup

**Benefits of Local Models:**

- **Privacy**: All data stays on your device
- **Cost**: No API usage fees after initial setup
- **Offline**: Works without internet connection
- **Customization**: Choose from various specialized models

### 🛠️ Common API Issues & Solutions

#### 🔗 Connection Issues

1. Check your internet connection stability
2. Verify the API URL is correct
3. Test with manual API call to verify connectivity
4. Check firewall settings for API request blocking
5. Consider VPN issues in certain regions

#### 🔐 Authentication Issues

1. Double-check your API key is correct
2. Ensure your account is active
3. Verify your account has sufficient credits/balance
4. Check API key permissions
5. Try generating a new API key

#### ⚡ Rate Limiting & Quotas

1. Review your plan's rate limits
2. Consider upgrading to higher tier
3. Space out API requests
4. Combine multiple requests when possible

#### 📄 Response Format Issues

1. Reduce the context window setting
2. Break large files into smaller chunks
3. Limit the amount of text per request
4. Use models with larger context limits
5. Remove unnecessary content before processing

#### 🚀 Performance Issues

1. Verify provider's service status
2. Set lower max_tokens limit
3. Switch to quicker models like GPT-4o-mini
4. Use concise and clear rules

### 💡 Provider Selection Tips

- **For Code Review**: OpenAI GPT-4, Claude-3.5 Sonnet, or DeepSeek-Coder
- **For Large Files**: Google Gemini (2M context) or Claude (200K context)
- **For Cost Efficiency**: OpenAI GPT-4o-mini, Moonshot, or local models
- **For Chinese Content**: Qwen, ERNIE, Hunyuan, or Doubao
- **For Latest Features**: GPT-4o, Claude-3.5 Sonnet, or Gemini-1.5 Pro
- **For Privacy**: Local models via Ollama, vLLM, or LM Studio`
      },
      basic: {
        title: '⚙️ Basic Settings Configuration',
        content: `## ⚙️ Basic Settings Configuration

### 🌟 Configuration Options

| Setting | Function | Default/Options | Notes |
|---------|----------|----------------|--------|
| **Language** | Set user interface language | English, 中文 | Interface language and AI Response Language |
| **API Provider** | Select AI service provider | OpenAI, Claude, DeepSeek, Gemini, Qwen, Grok, OpenAI Compatible... | Each has different models, pricing, capabilities |
| **AI Model** | Choose specific model | Auto-updated based on provider | Larger models = better quality + higher cost |
| **API URL** | Custom API endpoint | Auto-filled by provider | Required only for OpenAI Compatible |
| **API Key** | Authentication credential | User-provided | Encrypted locally, never shared with servers |
| **Output Length** | AI response token limit | 4000 tokens (100-8000 recommended) | Too small = truncated; too large = rejected |
| **Context Window** | Input token limit per request | 32768 tokens | Auto-splits when exceeded; rarely needs adjustment |
| **Connection Test** | Verify API configuration | Test button | Validates settings before use |

### 📊 Analysis & Export Settings

| Setting | Function | Options | Use Cases |
|---------|----------|---------|-----------|
| **Detail Level** | Control analysis depth | Simple, Balanced, Detailed | Simple = fast; Detailed = thorough + slower |
| **Export Layout** | Report organization | By Rule, By File | By Rule = rule-focused; By File = file-focused |
| **Filter Passed** | Show only problems | Enable/Disable | Enable = issues only; Disable = all results |
| **Collapse Function** | HTML report navigation | Enable/Disable | Enable for large reports with many sections |
| **Reset Settings** | Restore defaults | One-click reset | Cannot be undone; preserves API keys |

### 🔧 Configuration Tips

- **For Code Review**: Choose models with strong programming capabilities (GPT-4, Claude-3.5-Sonnet, DeepSeek-Coder)
- **For Large Files**: Use providers with large context windows (Gemini 2M, Claude 200K, Kimi 128K)
- **For Cost Efficiency**: Consider GPT-4o-mini, DeepSeek, or local models via OpenAI Compatible
- **For Chinese Content**: Qwen, ERNIE, Hunyuan, or Doubao provide better Chinese understanding
- **For Privacy**: Use local models via Ollama with OpenAI Compatible setting`
      },
              advanced: {
          title: '🚀 Advanced Features Configuration',
          content: `## 🚀 Advanced Features Configuration

### ⚡ Core Advanced Features

| Feature | Function | Options/Settings | Pro Required | Use Cases |
|---------|----------|------------------|--------------|-----------|
| **Review Mode** | Result management & filtering | Accept/Pending/Reject status | No | Team reviews, QA workflows, progress tracking |
| **Parallel Tasks** | Concurrent API requests | 1-10 tasks (Free: max 1) | Yes (>1) | Multi-file processing, faster reviews |
| **Multi-File Analysis** | Analyze files as cohesive unit | Enable/Disable | No | Cross-file dependencies, architecture validation |
| **AI Repair Suggestions** | Generate fix buttons in reports | Enable/Disable + sub-options | Yes | Quick fixes, learning from AI suggestions |

### 🔧 Detailed Configuration

| Setting | Description | Recommended Values | Important Notes |
|---------|-------------|-------------------|----------------|
| **Parallel Tasks** | Number of simultaneous API calls | 3-8 for most users | Higher values may trigger rate limits |
| **Include File Content** | Full context for AI repair | Enable for accuracy | Increases token usage significantly |
| **Require Detailed Plan** | AI explains before suggesting | Enable for safety | Reduces risk of inappropriate changes |
| **Context Window Monitoring** | Track merged file size | Auto-calculated | Exceeding limits reduces effectiveness |

### 🎯 Feature Benefits & Limitations

| Feature | Benefits | Limitations | Best Practices |
|---------|----------|-------------|----------------|
| **Review Mode** | Systematic tracking, team collaboration | Local storage only | Use for structured review processes |
| **Parallel Tasks** | 3-5x faster processing, better resource use | Rate limits, higher costs | Start with 3-5, adjust based on provider |
| **Multi-File Analysis** | Cross-file consistency, architecture insights | Context window limits, slower processing | Group related files only (component + test + types) |
| **AI Repair** | Quick fixes, learning tool | HTML reports only, separate API calls | Use selectively for complex issues |

### 💡 Optimization Tips

**Performance Optimization**:

- Start with 3 parallel tasks, increase gradually
- Monitor provider rate limits and adjust accordingly
- Use multi-file analysis for related components only

**Cost Management**:

- Higher parallel tasks = faster completion but higher short-term costs
- Balance speed vs. cost based on project needs

**Quality Assurance**:

- Enable "Require Detailed Plan" for AI suggestions
- Use Review Mode for systematic code review processes
- Test advanced settings with small files first`
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

### 🎁 New User Experience

**7-Day Pro Trial**: All new users automatically get full Pro access for 7 days

- No credit card required to start
- Full access to all Pro features
- Seamless transition to Free tier if not upgraded

### 💰 Annual Subscription Benefit

**Pay for 10 months, get 12 months**: Annual subscribers save 2 months compared to monthly billing

### 📊 Feature Comparison

| Feature | Free Version | Pro Version |
|---------|-------------|-------------|
| File Analysis | ✅ Multi files | ✅ Multi files |
| All AI Providers | ✅ All supported | ✅ All supported |
| Predefined Rules | ✅ All rule sets | ✅ All rule sets |
| Multi-File Analysis | ✅ Supported | ✅ Supported |
| Basic Export | ✅ HTML | ✅ HTML |
| Custom Rules | ❌ Not available | ✅ Create & import |
| Review Mode | ❌ Not available | ✅ Accept/Pending/Reject |
| Parallel Tasks | ❌ 1 task only | ✅ Up to 10 tasks |
| AI Repair Suggestions | ❌ Not available | ✅ In exported reports |
| Advanced Export | ❌ Basic formats only | ✅ Enhanced HTML with AI fixes |

### 🏷️ Pricing

- **Annual Plan**: $59.9/year (equivalent to ~$5/month)
- **Monthly Plan**: $5.9/month

### 🔄 Subscription Management

- Cancel anytime, continue using until period ends
- Automatic renewal (can be disabled)`
      },
      support: {
        title: '📞 Support & Feedback',
        content: `## 📞 Support & Feedback

### Getting Help

- Email: support@deepreview.cloud

### Feedback

We value your feedback! Help us improve DeepReview by sharing your experience and suggestions.`
      }
    };
  }

  getStaticZhContent() {
    return {
      scenarios: {
        title: '🎯 代码检视',
        content: `## 🎯 代码检视

DeepReview 是一个高度灵活的 AI 驱动的审查工具，支持预定义和自定义规则。
- **错误检测**：语法错误、逻辑错误、潜在运行时错误
- **安全漏洞检测**：SQL注入、XSS攻击、认证问题等
- **性能优化**：资源泄漏、低效算法、不当的数据结构使用
- **代码风格**：命名规范、注释完整性、代码组织结构
- **技术文档**：API文档、用户手册、技术规范
- **一致性检查**：术语使用、格式统一、内容完整性
- **可读性提升**：语言清晰度、逻辑结构、示例代码
- **代码评审**：Pull Request 自动审查
- **标准化**：团队编码规范统一

### 💻 审查工作流程

通过以下步骤体验 DeepReview 的完整功能：

#### 第1步：配置 AI 供应商
首先需要配置您的 AI 供应商设置，选择合适的模型和 API。

<div class="operation-step">
  <img src="./assets/images/step1-settings.png" alt="配置 AI 供应商" class="step-image" />
  <p class="step-description">在设置界面中选择 AI 供应商（如 Deepseek），配置模型参数和 API 密钥。系统会自动测试连接确保配置正确。</p>
</div>

#### 第2步：导入要审查的文件
将需要审查的代码文件导入到系统中。

<div class="operation-step">
  <img src="./assets/images/step2-import-files.png" alt="导入文件" class="step-image" />
  <p class="step-description">点击"Import Files"按钮导入Python文件。系统支持多种编程语言，会自动识别文件类型并显示代码内容。</p>
</div>

#### 第3步：选择审查规则
根据代码类型选择合适的预定义规则集。

<div class="operation-step">
  <img src="./assets/images/step3-select-rules.png" alt="选择规则" class="step-image" />
  <p class="step-description">点击"Import Rules"选择代码审查规则。系统提供多种预定义规则集，包括代码风格、安全检查、性能优化等。</p>
</div>

#### 第4步：开始AI审查
启动 AI 审查进程，等待分析完成。

<div class="operation-step">
  <img src="./assets/images/step4-start-review.png" alt="开始审查" class="step-image" />
  <p class="step-description">点击"Start Review"按钮开始审查。系统会显示进度条，AI会逐条分析选中的规则并生成详细的审查报告。</p>
</div>

#### 第5步：查看审查结果
获得详细的 AI 审查报告和改进建议。

<div class="operation-step">
  <img src="./assets/images/step5-view-results.png" alt="查看结果" class="step-image" />
  <p class="step-description">审查完成后，右侧面板显示详细的发现问题和改进建议。每个问题都包含具体的代码位置、问题描述和解决方案。</p>
</div>

#### 第6步：处理审查建议
根据 AI 建议对代码进行相应的修改和优化。

<div class="operation-step">
  <img src="./assets/images/step6-handle-suggestions.png" alt="处理建议" class="step-image" />
  <p class="step-description">可以接受、拒绝或标记为待处理状态。系统支持导出审查报告，方便团队协作和代码改进跟踪。</p>
</div>

`
      },
      providers: {
        title: '🔗 AI 供应商配置',
        content: `## 🔗 AI 供应商配置

DeepReview 支持多个 AI 供应商，您可以选择最适合您需求和预算的供应商。

### 🌟 支持的 AI 供应商

| 供应商 | 模型 | 上下文长度 | 官方网站 |
|--------|------|------------|----------|
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-4 Turbo, GPT-3.5 Turbo | 4K - 128K tokens | [openai.com](https://openai.com) |
| **Anthropic Claude** | Claude-3.5 Sonnet, Claude-3 Opus, Claude-3 Haiku | 200K tokens | [anthropic.com](https://anthropic.com) |
| **Google Gemini** | Gemini-1.5 Pro, Gemini-1.5 Flash, Gemini Pro | 1M - 2M tokens | [ai.google.dev](https://ai.google.dev) |
| **DeepSeek** | DeepSeek-Chat, DeepSeek-Coder | 32K tokens | [deepseek.com](https://deepseek.com) |
| **月之暗面 (Kimi)** | Moonshot-v1-8k, Moonshot-v1-32k, Moonshot-v1-128k | 8K - 200K tokens | [moonshot.cn](https://moonshot.cn) |
| **阿里云通义千问** | Qwen-Turbo, Qwen-Plus, Qwen-Max | 6K - 30K tokens | [bailian.console.aliyun.com](https://bailian.console.aliyun.com) |
| **百度文心一言** | ERNIE-4.0, ERNIE-3.5, ERNIE-Bot-turbo | 5K - 20K tokens | [cloud.baidu.com](https://cloud.baidu.com) |
| **腾讯混元** | Hunyuan-Pro, Hunyuan-Standard, Hunyuan-Lite | 32K tokens | [cloud.tencent.com](https://cloud.tencent.com) |
| **字节跳动豆包** | Doubao-pro-32k, Doubao-lite-4k | 4K - 32K tokens | [volcengine.com](https://volcengine.com) |
| **xAI Grok** | Grok-2, Grok-2-mini | 131K tokens | [x.ai](https://x.ai) |

### 🔧 配置步骤

1. 打开 DeepReview 设置并导航到"通用"标签页
2. 从支持的供应商下拉列表中选择 AI 供应商
3. 输入您的 API 密钥并选择要使用的具体模型
4. 配置 API URL、上下文窗口和输出长度设置
5. 点击"测试 API 连接"验证设置
6. 保存配置 - 设置在本地存储并加密

### 🔐 安全与隐私

- **本地存储**：所有 API 密钥都存储在您的设备上
- **加密存储**：API 密钥在存储前会被加密
- **无服务器传输**：您的密钥永远不会通过我们的服务器
- **直接通信**：DeepReview 直接连接到您选择的 AI 供应商

### 🏠 本地模型部署

您可以使用 **Ollama** 在本地运行 AI 模型，并连接到 DeepReview。

#### 使用 Ollama

**Ollama** 是运行本地 AI 模型最简单的方式，支持 Llama、Mistral、CodeLlama 和 Qwen 等热门模型。

**安装与设置：**

1. 从 [ollama.ai](https://ollama.ai) 下载并安装 Ollama
2. 启动 Ollama 服务：\`ollama serve\`
3. 下载模型：\`ollama pull codellama:13b\`
4. 在 DeepReview 中选择"OpenAI Compatible"作为 AI 供应商
5. 设置 API URL 为本地URL，例如 \`http://localhost:11434/v1/chat/completions\`
6. 使用任意虚拟密钥如 \`local-key\` 作为 API 密钥
7. 输入模型名称（如 \`codellama:13b\`）
8. 测试连接以验证设置

**本地模型的优势：**

- **隐私保护**：所有数据保留在您的设备上
- **成本节约**：初始设置后无 API 使用费用
- **离线工作**：无需互联网连接即可使用
- **模型选择**：可选择各种专业模型

### 🛠️ API 常见问题与解决方案

#### 🔗 连接问题

1. 确保网络连接稳定
2. 确认端点 URL 正确
3. 尝试手动 API 调用验证连通性
4. 检查防火墙设置
5. 考虑某些地区可能屏蔽特定供应商

#### 🔐 身份验证问题

1. 仔细检查 API 密钥是否正确
2. 确保账户处于活跃状态
3. 验证账户有足够的额度/余额
4. 确保 API 密钥具有所需权限
5. 尝试生成新的 API 密钥

#### ⚡ 速率限制和配额

1. 查看您套餐的速率限制
2. 考虑升级到更高级别
3. 间隔 API 请求
4. 尽可能合并多个请求

#### 📄 响应格式问题

1. 减少上下文窗口设置
2. 将大文件分解为较小的块
3. 限制每次请求的文本量
4. 使用上下文限制更大的模型
5. 处理前删除不必要的内容

#### 🚀 性能问题

1. 验证供应商的服务状态
2. 设置较低的 max_tokens 限制
3. 切换到更快的模型如 GPT-4o-mini
4. 使用简洁明确的规则

### 💡 供应商选择建议

- **代码审查推荐**：OpenAI GPT-4、Claude-3.5 Sonnet 或 DeepSeek-Coder
- **大文件处理**：Google Gemini（2M 上下文）或 Claude（200K 上下文）
- **成本效益优先**：OpenAI GPT-4o-mini、月之暗面或本地模型
- **中文内容优化**：通义千问、文心一言、混元或豆包
- **最新功能体验**：GPT-4o、Claude-3.5 Sonnet 或 Gemini-1.5 Pro
- **隐私保护优先**：通过 Ollama、vLLM 或 LM Studio 部署的本地模型`
      },
      basic: {
        title: '⚙️ 基础设置配置',
        content: `## ⚙️ 基础设置配置

### 🌟 配置选项

| 设置项 | 功能 | 默认值/选项 | 注意事项 |
|-------|------|------------|----------|
| **语言** | 设置用户界面语言 | English, 中文 | 影响界面语言及AI返回结果 |
| **AI供应商** | 选择AI服务提供商 | OpenAI, Claude, DeepSeek, Gemini, 通义千问, Kimi, 文心一言, 混元, 豆包, Grok, OpenAI Compatible | 每个供应商有不同的模型、定价和功能 |
| **AI模型** | 选择具体模型 | 根据供应商自动更新 | 更大模型 = 更好质量 + 更高成本 |
| **API URL** | 自定义API端点 | 根据供应商自动填充 | 仅OpenAI Compatible时必填 |
| **API密钥** | 身份验证凭据 | 用户提供 | 本地加密存储，绝不与服务器共享 |
| **输出长度** | AI响应token限制 | 4000 tokens (建议100-8000) | 太小会截断，太大会被拒绝 |
| **上下文窗口** | 每请求输入token限制 | 32768 tokens | 超限时自动分片，通常无需调整 |
| **连接测试** | 验证API配置 | 测试按钮 | 使用前验证设置 |

### 📊 分析与导出设置

| 设置项 | 功能 | 选项 | 使用场景 |
|-------|------|------|----------|
| **详细程度** | 控制分析深度 | 简单, 均衡, 详细 | 简单=快速；详细=彻底+较慢 |
| **导出排版** | 报告组织结构 | 按规则, 按文件 | 按规则=规则导向；按文件=文件导向 |
| **过滤通过项** | 仅显示问题 | 启用/禁用 | 启用=仅问题；禁用=所有结果 |
| **折叠功能** | HTML报告导航 | 启用/禁用 | 启用适合多章节的大型报告 |
| **重置设置** | 恢复默认值 | 一键重置 | 无法撤销，保留API密钥 |

### 🔧 配置建议

- **代码审查推荐**：选择编程能力强的模型（GPT-4, Claude-3.5-Sonnet, DeepSeek-Coder）
- **大文件处理**：使用大上下文窗口的供应商（Gemini 2M, Claude 200K, Kimi 128K）
- **成本效益优先**：考虑 GPT-4o-mini, DeepSeek 或通过 OpenAI Compatible 的本地模型
- **中文内容优化**：通义千问、文心一言、混元或豆包提供更好的中文理解
- **隐私保护优先**：通过 Ollama 使用本地模型配合 OpenAI Compatible 设置`
      },
      advanced: {
        title: '🚀 高级功能配置',
        content: `## 🚀 高级功能配置

### ⚡ 核心高级功能

| 功能 | 作用 | 选项/设置 | 需要Pro | 使用场景 |
|------|------|----------|---------|----------|
| **审阅模式** | 结果管理与过滤 | 接受/待处理/拒绝状态 | 否 | 团队审查、QA工作流、进度跟踪 |
| **并行任务** | 并发API请求 | 1-10个任务（免费版最多1个） | 是(>1) | 多文件处理、加速审查 |
| **多文件分析** | 文件整体分析 | 启用/禁用 | 否 | 跨文件依赖、架构验证 |
| **AI修复建议** | 报告中生成修复按钮 | 启用/禁用 + 子选项 | 是 | 快速修复、AI学习建议 |

### 🔧 详细配置

| 设置项 | 描述 | 建议值 | 重要提醒 |
|-------|------|--------|----------|
| **并行任务数** | 同时进行的API调用数量 | 大多数用户3-8个 | 高值可能触发速率限制 |
| **包含文件内容** | AI修复的完整上下文 | 启用以提高准确性 | 显著增加token使用量 |
| **要求详细计划** | AI先解释再建议 | 启用以提高安全性 | 降低不当更改的风险 |
| **上下文窗口监控** | 跟踪合并文件大小 | 自动计算 | 超限会降低效果 |

### 🎯 功能优势与限制

| 功能 | 优势 | 限制 | 最佳实践 |
|------|------|------|----------|
| **审阅模式** | 系统化跟踪、团队协作 | 仅本地存储 | 用于结构化审查流程 |
| **并行任务** | 3-5倍处理加速、更好资源利用 | 速率限制、成本增加 | 从3-5开始，根据供应商调整 |
| **多文件分析** | 跨文件一致性、架构洞察 | 上下文窗口限制、处理较慢 | 仅分组相关文件（组件+测试+类型） |
| **AI修复** | 快速修复、学习工具 | 仅HTML报告、单独API调用 | 有选择地用于复杂问题 |

### 💡 优化建议

**性能优化**：

- 从3个并行任务开始，逐步增加
- 监控供应商速率限制并相应调整
- 仅对相关组件使用多文件分析

**成本管理**：

- 更高并行任务数 = 更快完成但短期成本更高
- 根据项目需求平衡速度与成本

**质量保证**：

- 为AI建议启用"要求详细计划"
- 使用审阅模式进行系统化代码审查流程
- 先用小文件测试高级设置`
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

### 🎁 新用户体验

**7天高级功能体验**：所有新用户自动获得7天完整Pro功能访问

- 无需信用卡即可开始
- 完整访问所有Pro功能
- 如不升级可无缝转为免费版

### 💰 年费会员优惠

**付10个月享12个月**： 年费会员相比月付节省2个月费用

### 📊 功能对比

| 功能 | 免费版 | Pro版 |
|------|--------|-------|
| 文件分析 | ✅ 多个文件 | ✅ 多个文件 |
| 所有AI供应商 | ✅ 全部支持 | ✅ 全部支持 |
| 预定义规则 | ✅ 所有规则集 | ✅ 所有规则集 |
| 多文件分析 | ✅ 支持 | ✅ 支持 |
| 基础导出 | ✅ HTML | ✅ HTML |
| 审阅模式 | ❌不支持 | ✅ 接受/待定/拒绝 |
| 自定义规则 | ❌ 不可用 | ✅ 创建&导入 |
| 并行任务 | ❌ 仅1个任务 | ✅ 最多10个任务 |
| AI修复建议 | ❌ 不可用 | ✅ 导出报告中可用 |
| 高级导出 | ❌ 仅基础格式 | ✅ 增强HTML含AI修复 |

### 🏷️ 定价

- **年度套餐**：$59.9/年（相当于约$5/月）
- **月度套餐**：$5.9/月

### 🔄 订阅管理

- 随时取消，服务使用至当期结束
- 自动续费（可关闭）`
      },
      support: {
        title: '📞 支持与反馈',
        content: `## 📞 支持与反馈

### 获取帮助

- 邮箱：support@deepreview.cloud

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
    
    // Image click to enlarge
    this.setupImageEnlarge();
    
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

  setupImageEnlarge() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('step-image')) {
        this.enlargeImage(e.target);
      }
    });
  }

  enlargeImage(img) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="image-modal-content">
        <img src="${img.src}" alt="${img.alt}" class="enlarged-image" />
        <button class="close-modal" title="关闭">&times;</button>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(modal);
    
    // Close handlers
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('close-modal')) {
        document.body.removeChild(modal);
      }
    });
    
    // Keyboard close
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
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
  
  /* Fix for ordered lists in guide content */
  #guideArticle ol {
    counter-reset: list-counter;
    padding-left: 0;
  }
  
  #guideArticle ol > li {
    counter-increment: list-counter;
    list-style: none;
    padding-left: 2em;
    position: relative;
    margin-bottom: 1em;
  }
  
  #guideArticle ol > li::before {
    content: counter(list-counter) ".";
    position: absolute;
    left: 0;
    font-weight: bold;
    color: var(--primary, #007acc);
  }
  
  /* Nested lists styling */
  #guideArticle ol ol {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  /* Problem and Solution sections spacing */
  #guideArticle h4 + p strong {
    display: block;
    margin-bottom: 0.5em;
  }
`;
document.head.appendChild(style);
