'use strict';

var tslib = require('tslib');
var i0 = require('@angular/core');
var core = require('@awesome-cordova-plugins/core');
require('rxjs');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var i0__namespace = /*#__PURE__*/_interopNamespaceDefault(i0);

var BackgroundMode = /** @class */ (function (_super) {
    tslib.__extends(BackgroundMode, _super);
    function BackgroundMode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BackgroundMode.prototype.enable = function () { return core.cordova(this, "enable", { "sync": true }, arguments); };
    BackgroundMode.prototype.disable = function () { return core.cordova(this, "disable", { "sync": true }, arguments); };
    BackgroundMode.prototype.setEnabled = function (enable) { return core.cordova(this, "setEnabled", { "sync": true }, arguments); };
    BackgroundMode.prototype.fireEvent = function (event) {
        return core.cordova(this, "fireEvent", { "sync": true }, arguments);
    };
    BackgroundMode.prototype.isEnabled = function () { return core.cordova(this, "isEnabled", { "sync": true }, arguments); };
    BackgroundMode.prototype.isActive = function () { return core.cordova(this, "isActive", { "sync": true }, arguments); };
    BackgroundMode.prototype.setDefaults = function (overrides) { return core.cordova(this, "setDefaults", { "platforms": ["Android"] }, arguments); };
    BackgroundMode.prototype.configure = function (options) { return core.cordova(this, "configure", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.prototype.on = function (event) { return core.cordova(this, "on", { "observable": true, "clearFunction": "un", "clearWithArgs": true }, arguments); };
    BackgroundMode.prototype.un = function (event, callback) { return core.cordova(this, "un", {}, arguments); };
    BackgroundMode.prototype.moveToBackground = function () { return core.cordova(this, "moveToBackground", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.prototype.disableWebViewOptimizations = function () { return core.cordova(this, "disableWebViewOptimizations", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.prototype.moveToForeground = function () { return core.cordova(this, "moveToForeground", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.prototype.overrideBackButton = function () { return core.cordova(this, "overrideBackButton", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.prototype.excludeFromTaskList = function () { return core.cordova(this, "excludeFromTaskList", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.prototype.isScreenOff = function (fn) { return core.cordova(this, "isScreenOff", { "platforms": ["Android"] }, arguments); };
    BackgroundMode.prototype.wakeUp = function () { return core.cordova(this, "wakeUp", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.prototype.unlock = function () { return core.cordova(this, "unlock", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.prototype.disableBatteryOptimizations = function () { return core.cordova(this, "disableBatteryOptimizations", { "platforms": ["Android"], "sync": true }, arguments); };
    BackgroundMode.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: BackgroundMode, deps: null, target: i0__namespace.ɵɵFactoryTarget.Injectable });
    BackgroundMode.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: BackgroundMode });
    BackgroundMode.pluginName = "BackgroundMode";
    BackgroundMode.plugin = "cordova-plugin-background-mode";
    BackgroundMode.pluginRef = "cordova.plugins.backgroundMode";
    BackgroundMode.repo = "https://github.com/katzer/cordova-plugin-background-mode";
    BackgroundMode.platforms = ["AmazonFire OS", "Android", "Browser", "iOS", "Windows"];
    BackgroundMode = tslib.__decorate([], BackgroundMode);
    return BackgroundMode;
}(core.AwesomeCordovaNativePlugin));
i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: BackgroundMode, decorators: [{
            type: i0.Injectable
        }], propDecorators: { enable: [], disable: [], setEnabled: [], fireEvent: [], isEnabled: [], isActive: [], setDefaults: [], configure: [], on: [], un: [], moveToBackground: [], disableWebViewOptimizations: [], moveToForeground: [], overrideBackButton: [], excludeFromTaskList: [], isScreenOff: [], wakeUp: [], unlock: [], disableBatteryOptimizations: [] } });

exports.BackgroundMode = BackgroundMode;
