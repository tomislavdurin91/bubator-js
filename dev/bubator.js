window['BubatorJS'] = (function (window, document) {
    /** @suppress {checkTypes} */
    var passiveSupported = (function () {
        try {
            var options = { get passive() {} }
            window.addEventListener('test', options, options);
            window.removeEventListener('test', options, options);
            return true;
        } catch (err) {
            return false;
        }
    })();
    var triggerResize = (function () {
        if (typeof(Event) === 'function') {
            return function () {
                window.dispatchEvent(new Event('resize'));
            }
        } else {
            return function () {
                var evt = window.document.createEvent('UIEvents');
                evt.initUIEvent('resize', true, false, window, 0);
                window.dispatchEvent(evt);
            }
        }
    })();
    var debounce = function (func, wait, immediate) {
        var timeout;
        return function executedFunction () {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            }
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (immediate && !timeout) {
                func.apply(context, args);
            }
        }
    }
    var easeInOutQuad = function (t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	}
    var BubatorJS = function (selector, size) {
        if (BubatorJS.checkIfMobile) {
            return;
        }

        BubatorJS.instances = BubatorJS.instances || [];

        var instance = BubatorJS.getInstance(selector);
        if (instance) {
            return instance;
        }

        document.querySelector('#'+ selector).classList.add('bubator');
        this.scrollView = document.querySelector('#'+ selector +' .bubator-scrollview');
        this.cont = this.scrollView.querySelector('.bubator-content');
        this.vThumb = document.querySelector('#'+ selector +' .bubator-v-thumb');
        this.hThumb = document.querySelector('#'+ selector +' .bubator-h-thumb');

        this.cont.style.cssText = 'margin-right: '+ -BubatorJS.NBarWidth +'px; padding-bottom: '+ (80 - BubatorJS.NBarHeight) +'px;';

        this.observer = new MutationObserver(function () {
            triggerResize();
        });
        this.observer.observe(this.scrollView, {
            attributes: true,
            childList: true,
            subtree: true
        });

        BubatorJS.cssThumbSize = size || 8;

        this.overflowYOffset = 0;
        if (this.checkIfOverflowX()) {
            this.overflowYOffset = BubatorJS.cssThumbSize;
            this.scrollView.classList.add('h-track-active');
        }
        if (this.checkIfOverflowY()) {
            this.scrollView.classList.add('v-track-active');
        }

        this.onScrollRef = this.onScroll.bind(this);
        this.scrollView.addEventListener('scroll', this.onScrollRef, passiveSupported ? { passive: true } : false);

        if (!BubatorJS.inited ) {
            BubatorJS.inited = true;
            document.addEventListener('mousedown', BubatorJS.onMouseDown);
            document.addEventListener('mouseup', BubatorJS.onMouseUp);
            BubatorJS.mouseDeltaX = 0;
            BubatorJS.mouseDeltaY = 0;
            window.addEventListener('resize', BubatorJS.onResize);
        }

        this.hThumbLeft = 0;
        this.contScrollLeft = (this.hThumbLeft + BubatorJS.mouseDeltaX) * this.contScrollWidth / this.contWidth;
        this.cont.scrollLeft = this.contScrollLeft;

        BubatorJS.instances[selector] = this;
    }
    BubatorJS.checkIfMobile = (function () {
        return 'ontouchstart' in document.documentElement &&
                /Mobi|Android|Tablet|iPad|iPhone/i.test(navigator.userAgent);
    })();
    BubatorJS.getNBarDimms = (function () {
        var testDiv = document.createElement('div');
        testDiv.classList.add('bubator-test');
        document.body.appendChild(testDiv);
        BubatorJS.NBarWidth = testDiv.offsetWidth - testDiv.clientWidth;
        BubatorJS.NBarHeight = testDiv.offsetHeight - testDiv.clientHeight;
        document.body.removeChild(testDiv);
    })();
    BubatorJS.getInstance = function (selector) {
        if (selector in BubatorJS.instances) {
            return BubatorJS.instances[selector];
        }
    }
    BubatorJS.prototype.checkIfOverflowY = function () {
        this.scrollViewHeight = this.scrollView.offsetHeight - 80;
        this.scrollViewScrollHeight = this.scrollView.scrollHeight - 80;
        return this.scrollViewScrollHeight > this.scrollViewHeight;
    }
    BubatorJS.prototype.checkIfOverflowX = function () {
        this.contWidth = this.cont.offsetWidth;
        this.contScrollWidth = this.cont.scrollWidth;
        return this.contScrollWidth > this.contWidth;
    }
    BubatorJS.prototype.resizeVthumb = function () {
        this.vThumbHeight = ~~(this.scrollViewHeight * this.scrollViewHeight / this.scrollViewScrollHeight - this.overflowYOffset);
        if (this.vThumbHeight < 40) {
            var deltaY = ~~(((40 - this.vThumbHeight) * this.scrollViewScrollHeight / this.scrollViewHeight) - this.overflowYOffset);
            this.vThumbHeight = 40;
            this.scrollViewScrollHeight += deltaY;
        }
        this.vThumb.style.height = this.vThumbHeight + 'px';
    }
    BubatorJS.prototype.resizeHthumb = function () {
        this.hThumbWidth = ~~(this.contWidth * this.contWidth / this.contScrollWidth);
        if (this.hThumbWidth < 40) {
            var deltaX = ~~((40 - this.hThumbWidth) * this.contScrollWidth / this.contWidth);
            this.hThumbWidth = 40;
            this.contScrollWidth += deltaX;
        }
        this.hThumb.style.width = this.hThumbWidth + 'px';
    }
    BubatorJS.prototype.onScroll = function (e) {
        if (BubatorJS.userInteracting) {
            return;
        }
        this.scrollViewScrollTop = e.target.scrollTop;
        if (!BubatorJS.isScrolling) {
            requestAnimationFrame(this.scrollRAF.bind(this));
        }
        BubatorJS.isScrolling = true;
    }
    BubatorJS.prototype.scrollRAF = function () {
        BubatorJS.isScrolling = false;
        this.vThumbTop = ~~(this.scrollViewHeight * this.scrollViewScrollTop / this.scrollViewScrollHeight);
        this.vThumb.style.transform = 'translate3d(0px, '+ this.vThumbTop + 'px, 0px)';
    }
    BubatorJS.onMouseDown = function (e) {
        if (e.button > 1) {
            return;
        }

        if (e.target.classList.contains('bubator-v-thumb')) {
            e.preventDefault();
            BubatorJS.userInteracting = true;
            BubatorJS.self = BubatorJS.getInstance(e.target.parentNode.parentNode.id);
            BubatorJS.mouseLastPosY = e.clientY;
            BubatorJS.onMouseMoveVRef = BubatorJS.onMouseMoveV.bind(BubatorJS.self);
            document.addEventListener('mousemove', BubatorJS.onMouseMoveVRef);
            return;
        }

        if (e.target.classList.contains('bubator-v-track')) {
            e.preventDefault();
            BubatorJS.self = BubatorJS.getInstance(e.target.parentNode.id);
            BubatorJS.self['scrollVthumb'](e.clientY, false, true);
            return;
        }

        if (e.target.classList.contains('bubator-h-thumb')) {
            e.preventDefault();
            BubatorJS.userInteracting = true;
            BubatorJS.self = BubatorJS.getInstance(e.target.parentNode.parentNode.id);
            BubatorJS.mouseLastPosX = e.clientX;
            BubatorJS.onMouseMoveHRef = BubatorJS.onMouseMoveH.bind(BubatorJS.self);
            document.addEventListener('mousemove', BubatorJS.onMouseMoveHRef);
            return;
        }

        if (e.target.classList.contains('bubator-h-track')) {
            e.preventDefault();
            BubatorJS.self = BubatorJS.getInstance(e.target.parentNode.id);
            BubatorJS.self['scrollHthumb'](e.clientX, false, true);
        }
    }
    BubatorJS.onMouseMoveV = function (e) {
        if (!BubatorJS.isDragging) {
            BubatorJS.mouseDeltaY = e.clientY - BubatorJS.mouseLastPosY;
            BubatorJS.mouseLastPosY = e.clientY;
            requestAnimationFrame(this.moveVthumb.bind(this));
        }
        BubatorJS.isDragging = true;
    }
    BubatorJS.onMouseMoveH = function (e) {
        if (!BubatorJS.isDragging) {
            BubatorJS.mouseDeltaX = e.clientX - BubatorJS.mouseLastPosX;
            BubatorJS.mouseLastPosX = e.clientX;
            requestAnimationFrame(this.moveHthumb.bind(this, false));
        }
        BubatorJS.isDragging = true;
    }
    BubatorJS.prototype.moveVthumb = function () {
        BubatorJS.isDragging = false;

        this.scrollViewScrollTop = (this.vThumbTop + BubatorJS.mouseDeltaY) * this.scrollViewScrollHeight / this.scrollViewHeight;
        this.scrollView.scrollTop = this.scrollViewScrollTop;

        this.vThumbTop = this.scrollViewHeight * this.scrollViewScrollTop / this.scrollViewScrollHeight;
        if (this.vThumbTop + this.vThumbHeight > this.scrollViewHeight - this.overflowYOffset) {
            this.vThumb.style.transform = 'translate3d(0px, '+ (this.scrollViewHeight - this.vThumbHeight - this.overflowYOffset) +'px, 0px)';
            return;
        } else if (this.vThumbTop < 0) {
            this.vThumb.style.transform = 'translate3d(0px, 0px, 0px)';
            return;
        }
        this.vThumb.style.transform = 'translate3d(0px, '+ this.vThumbTop +'px, 0px)';
    }
    BubatorJS.prototype.moveHthumb = function (onlyRedraw) {
        BubatorJS.isDragging = false;

        if (!onlyRedraw) {
            this.contScrollLeft = (this.hThumbLeft + BubatorJS.mouseDeltaX) * this.contScrollWidth / this.contWidth;
            this.cont.scrollLeft = this.contScrollLeft;
        }

        this.hThumbLeft = this.contWidth * this.contScrollLeft / this.contScrollWidth;
        if (this.hThumbLeft + this.hThumbWidth > this.contWidth) {
            this.hThumb.style.transform = 'translate3d('+ (this.contWidth - this.hThumbWidth) +'px, 0px, 0px)';
            return;
        } else if (this.hThumbLeft < 0) {
            this.hThumb.style.transform = 'translate3d(0px, 0px, 0px)';
            return;
        }
        this.hThumb.style.transform = 'translate3d('+ this.hThumbLeft +'px, 0px, 0px)';
    }
    BubatorJS.prototype.limitVthumb = function () {
        if (this.vThumbTop + this.vThumbHeight > this.scrollViewHeight) {
            this.vThumbTop = this.scrollViewHeight - this.vThumbHeight;
        } else if (this.vThumbTop < 0) {
            this.vThumbTop = 0;
        }
    }
    BubatorJS.prototype.limitHthumb = function () {
        if (this.hThumbLeft + this.hThumbWidth > this.contWidth) {
            this.hThumbLeft = this.contWidth - this.hThumbWidth;
        } else if (this.hThumbLeft < 0) {
            this.hThumbLeft = 0;
        }
    }
    BubatorJS.prototype['scrollVthumb'] = function (dest, scrollBy, _fromBubator) {
        if (BubatorJS.userInteracting) {
            return
        }
        var t = 0,
            b = this.vThumbTop,
            c;

        if (_fromBubator) {
            c = dest - this.scrollView.getBoundingClientRect().top - this.vThumbHeight / 2 - b;
        } else if (scrollBy) {
            c = Math.ceil(dest * this.scrollViewHeight / this.scrollViewScrollHeight);
        } else if (typeof dest === 'number') {
            c = Math.ceil(dest * this.scrollViewHeight / this.scrollViewScrollHeight - b);
        } else {
            var el = document.querySelector(dest).offsetTop
            c = Math.ceil(el * this.scrollViewHeight / this.scrollViewScrollHeight - b);
        }

        requestAnimationFrame(this.scrollVthumbRAF.bind(this, t, b, c));
    }
    BubatorJS.prototype['scrollHthumb'] = function (dest, scrollBy, _fromBubator) {
        if (BubatorJS.userInteracting) {
            return
        }
        var t = 0,
            b = this.hThumbLeft,
            c;

        if (_fromBubator) {
            c = dest - this.scrollView.getBoundingClientRect().left - this.hThumbWidth / 2 - b;
        } else if (scrollBy) {
            c = Math.ceil(dest * this.contWidth / this.contScrollWidth);
        } else if (typeof dest === 'number') {
            c = Math.ceil(dest * this.contWidth / this.contScrollWidth - b);
        } else {
            var el = document.querySelector(dest).offsetLeft
            c = Math.ceil(el * this.contWidth / this.contScrollWidth - b);
        }

        requestAnimationFrame(this.scrollHthumbRAF.bind(this, t, b, c));
    }
    BubatorJS.prototype.scrollVthumbRAF = function (t, b, c) {
        BubatorJS.userInteracting = true;
        t++;
        this.vThumbTop = easeInOutQuad(t, b, c, 30);
        this.moveVthumb();
        if (t < 30) {
            requestAnimationFrame(this.scrollVthumbRAF.bind(this, t, b, c));
        } else {
            this.limitVthumb();
            BubatorJS.mouseDeltaY = 0;
            BubatorJS.userInteracting = false;
        }
    }
    BubatorJS.prototype.scrollHthumbRAF = function (t, b, c) {
        BubatorJS.userInteracting = true;
        t++;
        this.hThumbLeft = easeInOutQuad(t, b, c, 30);
        this.moveHthumb();
        if (t < 30) {
            requestAnimationFrame(this.scrollHthumbRAF.bind(this, t, b, c));
        } else {
            this.limitHthumb();
            BubatorJS.mouseDeltaX = 0;
            BubatorJS.userInteracting = false;
        }
    }
    BubatorJS.onMouseUp = function () {
        if (BubatorJS.self) {
            BubatorJS.self.limitVthumb();
            BubatorJS.self.limitHthumb();

            document.removeEventListener('mousemove', BubatorJS.onMouseMoveVRef);
            document.removeEventListener('mousemove', BubatorJS.onMouseMoveHRef);
            BubatorJS.onMouseMoveVRef = null;
            BubatorJS.onMouseMoveHRef = null;

            BubatorJS.self = null;
        }
        BubatorJS.userInteracting = false;
    }
    BubatorJS.onResize = function () {
        BubatorJS.userInteracting = true;
        BubatorJS.resizeDebounced();
    }
    BubatorJS.resizeDebounced = debounce(function () {
        BubatorJS.userInteracting = false;
        var cList;

        for (var i in BubatorJS.instances) {
            BubatorJS.self = BubatorJS.instances[i];
            cList = BubatorJS.self.scrollView.classList;

            if (BubatorJS.self.checkIfOverflowX()) {
                BubatorJS.self.overflowYOffset = BubatorJS.cssThumbSize;
                if (!cList.contains('h-track-active')) {
                    cList.add('h-track-active');
                }
                BubatorJS.self.resizeHthumb();
                BubatorJS.self.moveHthumb(true);
                BubatorJS.self.limitHthumb();
            } else {
                BubatorJS.self.overflowYOffset = 0;
                if (cList.contains('h-track-active')) {
                    cList.remove('h-track-active');
                }
            }

            if (BubatorJS.self.checkIfOverflowY()) {
                if (!cList.contains('v-track-active')) {
                    cList.add('v-track-active');
                }
                BubatorJS.isScrolling = false;
                BubatorJS.self.onScroll({
                    target: {
                        scrollTop: BubatorJS.self.scrollView.scrollTop
                    }
                });
                BubatorJS.self.resizeVthumb();
            } else {
                if (cList.contains('v-track-active')) {
                    cList.remove('v-track-active');
                }
            }
        }

        cList = null;
        BubatorJS.self = null;
    }, 100, false);
    BubatorJS.prototype['destroy'] = function () {
        if (BubatorJS.checkIfMobile) {
            return;
        }
        var id = this.scrollView.parentNode.id;
        if (!BubatorJS.getInstance(id)) {
            return
        }
        this.observer.disconnect();
        this.scrollView.removeEventListener('scroll', this.onScrollRef);
        this.onScrollRef = null;
        this.scrollView.classList.remove('h-track-active');
        this.scrollView.classList.remove('v-track-active');
        this.cont.removeAttribute('style');
        document.querySelector('#' + id).classList.remove('bubator');
        delete BubatorJS.instances[id];
    }
    BubatorJS['destroyAll'] = function () {
        if (BubatorJS.checkIfMobile) {
            return;
        }
        for (var i in BubatorJS.instances) {
            if (BubatorJS.instances.hasOwnProperty(i)) {
                BubatorJS.instances[i]['destroy'](i);
            }
        }
        document.removeEventListener('mousedown', BubatorJS.onMouseDown);
        document.removeEventListener('mouseup', BubatorJS.onMouseUp);
        window.removeEventListener('resize', BubatorJS.onResize);
        BubatorJS.inited = false;
    }
    return BubatorJS;
})(window, document);
