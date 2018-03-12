import TwigBase from '../../twig-base/twig-base';

export default class TceHero extends TwigBase {
  static get observedAttributes() {
    return ['src', 'text', 'subtext', 'callout-text', 'callout-href', 'align'];
  }

  getTemplate() {
    return require('./tce-hero.twig');
  }

  // render() {
  //   this.shadowRoot.innerHTML = '<p>Hello</p>';
  // }
}
