/**
 * Universal URL Parameters Handler
 * 通用URL参数处理器 - 用于在所有网站页面间传递用户信息
 */

class URLParamsHandler {
  constructor() {
    this.userParams = this.extractUserParams();
    this.init();
  }

  /**
   * 从当前URL中提取用户参数
   */
  extractUserParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      email: urlParams.get('email') || '',
      userName: urlParams.get('userName') || '',
      userSub: urlParams.get('userSub') || '',
      source: urlParams.get('source') || '',
      plan: urlParams.get('plan') || '',
      flowId: urlParams.get('flowId') || ''
    };
  }

  /**
   * 检查是否有用户信息
   */
  hasUserInfo() {
    return !!(this.userParams.email && this.userParams.email.trim());
  }

  /**
   * 构建包含用户参数的URL
   */
  buildURLWithParams(baseUrl, additionalParams = {}) {
    // 如果没有用户信息且没有额外参数，直接返回原URL
    if (!this.hasUserInfo() && Object.keys(additionalParams).length === 0) {
      return baseUrl;
    }

    try {
      // 构建参数字符串
      const params = new URLSearchParams();
      
      // 添加用户参数（如果存在）
      if (this.hasUserInfo()) {
        if (this.userParams.email) params.set('email', this.userParams.email);
        if (this.userParams.userName) params.set('userName', this.userParams.userName);
        if (this.userParams.userSub) params.set('userSub', this.userParams.userSub);
        if (this.userParams.source) params.set('source', this.userParams.source);
        if (this.userParams.plan) params.set('plan', this.userParams.plan);
        if (this.userParams.flowId) params.set('flowId', this.userParams.flowId);
      }
      
      // 添加额外参数
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      // 构建最终URL
      const paramString = params.toString();
      if (paramString) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        return baseUrl + separator + paramString;
      }
      
      return baseUrl;
    } catch (error) {
      console.warn('❌ URL构建失败，使用原始URL:', baseUrl, error);
      return baseUrl;
    }
  }

  /**
   * 更新指定链接的href属性
   */
  updateLink(linkElement, targetPage, additionalParams = {}) {
    if (!linkElement) return;
    
    try {
      const originalHref = linkElement.href;
      const newUrl = this.buildURLWithParams(targetPage, additionalParams);
      
      // 只有当URL确实改变时才更新
      if (newUrl !== originalHref && newUrl !== targetPage) {
        linkElement.href = newUrl;
      }
    } catch (error) {
      console.warn('❌ 链接更新失败:', targetPage, error);
    }
  }

  /**
   * 更新所有相关链接
   */
  updateAllLinks() {
    if (!this.hasUserInfo()) {
      return; // 没有用户信息时不需要更新
    }
    
    // 更新pricing链接
    const pricingLinks = [
      ...document.querySelectorAll('a[href="pricing.html"]'),
      ...document.querySelectorAll('a[href*="pricing.html"]'),
      document.getElementById('pricingNavLink'),
      document.getElementById('getStartedBtn')
    ].filter(Boolean);

    pricingLinks.forEach(link => {
      this.updateLink(link, 'pricing.html');
    });

    // 更新user-guide链接
    const userGuideLinks = [
      ...document.querySelectorAll('a[href="user-guide.html"]'),
      ...document.querySelectorAll('a[href*="user-guide.html"]')
    ].filter(Boolean);

    userGuideLinks.forEach(link => {
      this.updateLink(link, 'user-guide.html');
    });

    // 更新所有网站页面链接
    const websitePages = ['terms.html', 'privacy.html', 'refund.html', 'index.html'];
    websitePages.forEach(page => {
      const pageLinks = [
        ...document.querySelectorAll(`a[href="${page}"]`),
        ...document.querySelectorAll(`a[href*="${page}"]`)
      ].filter(Boolean);
      
      pageLinks.forEach(link => {
        this.updateLink(link, page);
      });
    });
  }

  /**
   * 初始化处理器
   */
  init() {
    const doInit = () => {
      this.updateAllLinks();
      this.observeNewLinks();
    };

    // 等待DOM加载完成后更新链接
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', doInit);
    } else {
      // DOM已加载，延迟一点执行确保其他脚本也加载完成
      setTimeout(doInit, 50);
    }
  }

  /**
   * 监听动态添加的链接
   */
  observeNewLinks() {
    // 确保DOM已加载且body存在
    const startObserver = () => {
      if (!document.body) {
        setTimeout(startObserver, 100);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'A' || node.querySelector('a')) {
                  shouldUpdate = true;
                }
              }
            });
          }
        });
        
        if (shouldUpdate) {
          setTimeout(() => this.updateAllLinks(), 100);
        }
      });

      try {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      } catch (error) {
        console.warn('❌ MutationObserver启动失败:', error);
      }
    };

    startObserver();
  }

  /**
   * 获取用户参数（供其他脚本使用）
   */
  getUserParams() {
    return { ...this.userParams };
  }

  /**
   * 手动更新用户参数
   */
  updateUserParams(newParams) {
    this.userParams = { ...this.userParams, ...newParams };
    this.updateAllLinks();
  }
}

// 创建全局实例
window.urlParamsHandler = new URLParamsHandler();

// 添加全局函数供强制更新使用
window.forceUpdateLinks = function() {
  if (window.urlParamsHandler) {
    window.urlParamsHandler.updateAllLinks();
  }
};

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = URLParamsHandler;
} 