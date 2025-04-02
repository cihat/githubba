export const isSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome');
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
};

export const openLinkInSafari = (url: string) => {
  try {
    const currentUrl = window.location.href;

    const popupWindow = window.open('about:blank', '_blank');

    if (popupWindow) {
      popupWindow.location.href = url;
      popupWindow.focus();
      return true;
    } else {
      window.location.href = url;

      setTimeout(() => {
        window.location.href = currentUrl;
      }, 2000);
      return true;
    }
  } catch (error) {
    console.error('Safari/iOS link açma hatası:', error);
    return false;
  }
};

export const openLinkInOtherBrowsers = (url: string) => {
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  } catch (error) {
    console.error('Link açma hatası:', error);
    return false;
  }
};


export const openLink = (url: string): boolean => {
  if (isSafari() && isIOS()) {
    return openLinkInSafari(url);
  } else {
    return openLinkInOtherBrowsers(url);
  }
};
