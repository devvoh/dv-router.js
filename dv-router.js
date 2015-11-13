/**
 * dv-router.js, 2015, Robin de Graaf, devvoh.com
 * https://github.com/devvoh/dv-router.js
 *
 * use:     var router = new dvRouter(routes);
 *
 * routes should be an object with elements laid out like so:
 *
 * {
 *     'url': function(params) { // stuff to do }
 *     'paramUrl/{username}': function(params) { // stuff to do }
 * }
 *
 * NOTE: Routes are entered into the route list WITHOUT the #/ prefix. So 'test': ... matches the
 *       actual url #/test. For home, simply use '' as the key.
 *
 * @param options
 * @returns {dvRouter}
 */
function dvRouter (options) {
    this.routes   = null;
    this.target   = null;
    this.callback = function() {};

    /**
     * Return the routes object
     *
     * @returns {null|dvRouter.routes}
     */
    this.getRoutes = function() {
        return this.routes;
    }

    /**
     * Set the routes object
     *
     * @param routes
     * @returns {dvRouter}
     */
    this.setRoutes = function(routes) {
        this.routes = routes;
        return this;
    }

    /**
     * Return the target element
     *
     * @returns {null|*}
     */
    this.getTarget = function() {
        return this.target;
    }

    /**
     * Set the target element
     *
     * @param target
     * @returns {dvRouter}
     */
    this.setTarget = function(target) {
        this.target = target;
        return this;
    }

    /**
     * Return the callback function
     *
     * @returns {Function|null}
     */
    this.getCallback = function() {
        return this.callback;
    }

    /**
     * Set the callback function
     *
     * @param callback
     * @returns {dvRouter}
     */
    this.setCallback = function(callback) {
        this.callback = callback;
        return this;
    }

    /**
     * Match the route and if found, execute the closure if it exists
     *
     * @param url
     * @returns bool|*
     */
    this.match = function(url) {
        var routes = this.getRoutes();
        var func = null;
        var params = {};

        // Get the hash-less url
        url = this.stripHash(url);

        if (routes[url] !== undefined) {
            // Literal match, no params, set anonymousFunction
            func = routes[url];
        } else {
            // Not literal, so we need to loop through the routes with params and break them up to compare & rebuild
            for (var routeUrl in routes) {
                if (routes.hasOwnProperty(routeUrl)) {
                    if (routeUrl.indexOf('{') >= 0) {
                        // In case a previous route failed, clear params for this run
                        params = {};
                        // We need to split both the route and the url
                        var routeSplit = routeUrl.split('/');
                        var urlSplit = url.split('/');

                        // We're only going to do the heavy lifting if the number of url parts are the same in both
                        if (routeSplit.length === urlSplit.length) {
                            // Loop through the route parts to start comparing
                            for (var i in routeSplit) {
                                // Look for a param delimiter ({}) and work some magic if this part is a param
                                if (routeSplit[i].indexOf('{') >= 0) {
                                    // Store the parameter (stripped of {}) & value together for future passing to callback
                                    var cleanParam = routeSplit[i].replace(/[{}]/g, "");
                                    params[cleanParam] = urlSplit[i];
                                    // To match url and route, we replace the value in the url with the param from the route
                                    urlSplit[i] = routeSplit[i];
                                }
                                // And on every param replace, we check if we've now got the entire url matched
                                if (urlSplit.join('/') == routeSplit.join('/')) {
                                    // It's a match, so we now have the same-ified url & route and a match, so this is
                                    // definitely the route we're looking for.
                                    func = routes[routeUrl];
                                }
                            }
                        }
                    }
                    // If we have our anonymousFunction, break the cycle
                    if (func) {
                        break;
                    }
                }
            }
        }

        // if func is a function, return the result of that function
        if ((typeof func) == 'function') {
            return func(params);
        }
        return false;

    };

    /**
     * Strips the hash from the start of the url string
     *
     * @param url
     * @returns string
     */
    this.stripHash = function(url) {
        if (url.substr(0,1) == '#') {
            var urlSplit = url.split('/');
            urlSplit.shift();
            url = urlSplit.join('/');
        }
        return url;
    };

    /**
     * Set content on the target element
     *
     * @param content
     * @returns {dvRouter}
     */
    this.setContent = function(content) {
        if (this.getTarget()) {
            this.getTarget().innerHTML = content;
        }
        return this;
    }

    /**
     * Take valid values from options object given while constructing dvRouter
     *
     * @returns {dvRouter}
     */
    this.loadOptions = function() {
        // If options are unset, we're done here
        if (options === undefined) {
            return this;
        }

        // If routes isn't null, set them
        if (options.routes !== undefined) {
            this.setRoutes(options.routes);
        }

        // If target isn't null, set it
        if (options.target) {
            this.setTarget(options.target);
        }

        // If callback isn't null, set it
        if (options.callback) {
            this.setCallback(options.callback);
        }

        return this;
    }

    /**
     * Run the router, which means call the configured callback on load and on hash changes
     */
    this.run = function() {
        // Load the options
        this.loadOptions();

        // Get callback and call it with a timeout (so Router is available for the callback), providing initial routing
        var callback = this.getCallback();
        setTimeout(function() {
            callback();
        }, 250);

        // And add an event handler to route on hash changes
        window.onhashchange = function () {
            callback();
        }
        return this;
    }
    return this;
}