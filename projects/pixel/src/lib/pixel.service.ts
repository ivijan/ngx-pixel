import { PixelConfiguration, PixelEventProperties } from './pixel.models';
import { Inject, Injectable, Optional } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare var fbq: any;

@Injectable({
  providedIn: 'root'
})
export class PixelService {

  constructor(
    @Inject('config') private config: PixelConfiguration,
    @Optional() private router: Router
  ) {

    if (router) {
      // Log page views after router navigation ends
      router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {

        if (this.isLoaded()) {
          this.track('PageView');
        }

      });
    }

  }

  /**
   * Initialize the Pixel tracking script
   * - Adds the script to page's head
   * - Tracks first page view
   */
  initialize(): void {
    this.config.enabled = true;
    this.addPixelScript(this.config.pixelId);
  }

  /** Remove the Pixel tracking script */
  remove(): void {
    this.removePixelScript();
    this.config.enabled = false;
  }

  /**
   * Track a Standard Event as predefined by Facebook
   * @see {@link https://developers.facebook.com/docs/facebook-pixel/reference}
   * @param eventName The name of the event that is being tracked
   * @param properties Optional properties of the event
   */
  track(
    eventName:
    'AddPaymentInfo' |
    'AddToCart' |
    'AddToWishlist' |
    'CompleteRegistration' |
    'Contact' |
    'CustomizeProduct' |
    'Donate' |
    'FindLocation' |
    'InitiateCheckout' |
    'Lead' |
    'PageView' |
    'Purchase' |
    'Schedule' |
    'Search' |
    'StartTrial' |
    'SubmitApplication' |
    'Subscribe' |
    'ViewContent',
    properties?: PixelEventProperties
    ): void {

    if (properties) {
      fbq('track', eventName, properties);
    } else {
      fbq('track', eventName);
    }

  }

  /**
   * Track a custom Event
   * @see {@link https://developers.facebook.com/docs/facebook-pixel/implementation/conversion-tracking#custom-conversions}
   * @param eventName The name of the event that is being tracked
   * @param properties Optional properties of the event
   */
  trackCustom(eventName: string, properties?: object): void {
    if (properties) {
      fbq('trackCustom', eventName, properties);
    } else {
      fbq('trackCustom', eventName);
    }
  }

  /**
   * Adds the Facebook Pixel tracking script to the application
   * @param pixelId The Facebook Pixel ID to use
   */
  private addPixelScript(pixelId: string): void {

    const pixelCode = `
    var pixelCode = function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');`;

    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('id', 'pixel-script');
    scriptElement.type = 'text/javascript';
    scriptElement.innerHTML = pixelCode;
    document.getElementsByTagName('head')[0].appendChild(scriptElement);
  }

  /** Remove Facebook Pixel tracking script from the application */
  private removePixelScript(): void {
    const pixelElement = document.getElementById('pixel-script');
    if (pixelElement) {
      pixelElement.remove();
    }
  }

  /** Checks if the script element is present */
  private isLoaded(): boolean {
    const pixelElement = document.getElementById('pixel-script');
    return !!pixelElement;
  }

}
