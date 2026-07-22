/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: vyepti.com site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. All selectors below were verified against the captured
 * DOM in migration-work/cleaned.html for the downloadable-resources page.
 *
 * KEPT (page content, do NOT remove):
 *  - .cmp-experiencefragment--isi  (Important Safety Information -> isi block)
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie / consent banner (blocks/overlays content).
    // Found in captured HTML:
    //   line 2: <div id="cookie-information-template-wrapper">
    //   line 9: <div id="coiConsentBanner" class="coi-consent-banner ...">
    WebImporter.DOMUtils.remove(element, [
      '#cookie-information-template-wrapper',
      '#coiConsentBanner',
      '.coi-consent-banner',
      '#coi-banner-wrapper',
    ]);

    // Hidden modals / popups / interstitials that are not inline page content.
    // These render as trailing "Email this resource" form, leave-site redirect
    // dialogs, and a "Have you been prescribed VYEPTI?" survey popup.
    // Found in captured HTML:
    //   .modal.email-modal-wrap (email-this-resource form -> #tile-modal target)
    //   .interstitialmodal / .popupinterstitialmodal (leave-site redirect dialogs)
    //   .modal.header-modal (HCP redirect dialog)
    //   .resourcemodal (survey popup wrapper)
    WebImporter.DOMUtils.remove(element, [
      '.modal',
      '.email-modal-wrap',
      '.interstitialmodal',
      '.popupinterstitialmodal',
      '.resourcemodal',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site shell: header/nav experience fragment and footer.
    // The header XF wraps the teal info strip, <header class="header-section">,
    // and all <nav class="navbar ...">. The footer XF wraps <footer id="footer">.
    // Found in captured HTML:
    //   line 1609: <div ... class="cmp-experiencefragment cmp-experiencefragment--header">
    //   line 2796: <div ... class="cmp-experiencefragment cmp-experiencefragment--footer">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      'footer#footer',
    ]);

    // Tracking / analytics noise at end of body (non-authorable).
    // Found in captured HTML:
    //   line 2986: <img src="https://www.googleadservices.com/pagead/conversion/...">
    //   line 2987: <iframe ... src="https://lundbeck.demdex.net/dest5.html...">
    //   line 2996: <iframe src="https://14213245.fls.doubleclick.net/activityi;...">
    element.querySelectorAll('img[src*="googleadservices.com"]').forEach((el) => el.remove());
    element.querySelectorAll('img[src*="bat.bing.com"], img[src*="deepintent.com"], img[src*="px."]').forEach((el) => el.remove());
    element.querySelectorAll('iframe[src*="demdex.net"], iframe[src*="doubleclick.net"]').forEach((el) => el.remove());

    // Generic non-authorable / non-content elements.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'noscript',
      'link',
      'style',
      'script',
    ]);
  }
}
