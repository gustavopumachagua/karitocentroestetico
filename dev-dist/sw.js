/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-47da91e0'], (function (workbox) { 'use strict';

	self.skipWaiting();
	workbox.clientsClaim();

	/**
	 * The precacheAndRoute() method efficiently caches and responds to
	 * requests for URLs in the manifest.
	 * See https://goo.gl/S9QRab
	 */
	workbox.precacheAndRoute([{
	  "url": "index.html",
	  "revision": "0.bf9v18vnb8g"
	}], {});
	workbox.cleanupOutdatedCaches();
	workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
	  allowlist: [/^\/$/]
	}));
	// API responses and authenticated requests may contain clinical or payment
	// data. This tracked development worker must follow the production policy:
	// always go to the network and never persist them in Cache Storage.
	workbox.registerRoute(({
	  url,
	  request
	}) => url.pathname.startsWith("/api/") || request.headers.has("authorization"), new workbox.NetworkOnly(), 'GET');
	workbox.registerRoute(({
	  url,
	  request
	}) => {
	  const sameOrigin = url.origin === self.location.origin;
	  const staticAsset = url.pathname.startsWith("/assets/") || ["/favicon.ico", "/apple-touch-icon.png", "/mask-icon.svg", "/Logo.jpg", "/Logo_SEO.png"].includes(url.pathname);
	  return sameOrigin && staticAsset && ["script", "style", "image", "font"].includes(request.destination);
	}, new workbox.CacheFirst({
	  "cacheName": "karito-static-cache",
	  plugins: [new workbox.ExpirationPlugin({
	    maxEntries: 200,
	    maxAgeSeconds: 2592000
	  }), new workbox.CacheableResponsePlugin({
	    statuses: [0, 200]
	  })]
	}), 'GET');

}));
