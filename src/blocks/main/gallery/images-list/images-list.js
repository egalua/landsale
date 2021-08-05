import './img/gallery-images.js'
import PopupGallery from './gallery-slider/gallery-slider.js'

/**
 * Класс основной галереи
 */
class Gallery{
    constructor(className = 'gallery'){
        this.cssNames = {
            // секция галереи: картинки + описание
            gallery: 'gallery',
            // внешний контейнер галереи article.gallery__images
            extGalleryBox: 'gallery__images',
            // контейнер галереи: картинки и всё, что нужно для popupGallery
            originalGalleryBox: 'images-box',
            // лента с preview картинками
            tape: 'img-contents__imgs-tape',
            // элемент ленты
            tapeItem: 'img-contents__imgs-tape-item',
            // viewfinder для ленты с preview картинками
            viewfinder: 'img-contents__imgs-tape-hidden-box',
            // блок с глазом Саурона
            pointerBox: 'images-box__pointer-box'
        };
        this.cssNames.gallery = className;
        // секция галерея: картинки + описание
        this.gallery = document.querySelector('.' + className);
        // всплывающая галерея
        this.popupGallery = new PopupGallery(this.cssNames.originalGalleryBox);
        // внешний контейнер галереи с data атрибутами data-mobile-offset и data-desktop-offset
        this.extGalleryBox = this.gallery.querySelector('.' + this.cssNames.extGalleryBox);
        // контейнер ленты со свойством overflow: hidden
        this.tapeBox = this.extGalleryBox.querySelector('.' + this.cssNames.viewfinder);
        // лента с картинками
        this.tape = this.tapeBox.querySelector('.' + this.cssNames.tape);
        
        // параметры и переменные для обработки touch событий
        this.touchSettings = {
            startX: 0, // координата X при touchstart
            startY: 0, // координата Y при touchstart
            dist: 0, // расстояние от точки прикосновения до точки отрыва
            threshold: 100, // минимальное расстояние для swipe
            yDeviationHold: 150, // максимальное отклонение по вертикали
            allowedTime: 1000, // максимальное время прохождения установленного расстояния
            elapsedTime: 0, // пройденное время от touchstart до touchend
            startTime: 0 // время возникновения события touchstart
        };

        // установка обработчиков событий галереи
        this.setHandlers();
        
    }
    // ----- getters & setters -----
    /**
     * getter для свойства this.desktopOffset
     * (для варианта desktop & tablet)
     * @returns {Integer} возвращает индекс смещения ленты галереи
     */
    get desktopOffset(){
        return parseInt(this.extGalleryBox.getAttribute('data-desktop-offset'));
    }
    /**
     * setter для свойства this.desktopOffset
     * (для варианта desktop & tablet)
     * @argument {Integer} idx индекс смещения ленты галереи
     */
    set desktopOffset(idx){
        if(idx >= 0){
            this.extGalleryBox.setAttribute('data-desktop-offset', idx);
        }
    }
    /**
     * getter для свойства this.mobileOffset
     * (для варианта mobile)
     * @returns {Integer} индекс смещения ленты галереи
     */
    get mobileOffset(){
        return parseInt(this.extGalleryBox.getAttribute('data-mobile-offset'));
    }
    /**
     * setter для свойства this.mobileOffset
     * (для варианта mobile)
     * @argument {Integer} idx индекс смещения ленты галереи
     */
    set mobileOffset(idx){
        if(idx >=0 ){
            this.extGalleryBox.setAttribute('data-mobile-offset', idx);
        }
    }
    
    // ----- align methods -----
    /**
     * Выравнивает ленту по правой границе контейнера, если это необходимо
     * @param {Float} idx индекс смещения ленты
     * @returns {Float} смещение ленты после выравнивания
     */
    alignTape(idx){
        // стили ленты
        const tapeStyle = window.getComputedStyle(this.tape);
        // стили контейнера ленты
        const viewfinderStyle = window.getComputedStyle(this.tapeBox);
        // ширина ленты
        let tapeWidth = parseFloat(tapeStyle.width);
        // отступы между элементами
        let colGap = parseFloat(tapeStyle.columnGap);
        // ширина контейнера ленты
        let viewfinderWidth = parseFloat(viewfinderStyle.width) - parseFloat(viewfinderStyle.paddingLeft) - parseFloat(viewfinderStyle.paddingRight);
        // максимально допустимый индекс смещения ленты
        let maxIdx = 0;
        
        idx = idx < 0 ? 0: idx;

        if(this._getViewportWidth() <= 767){
            // mobile
            maxIdx = this.getMaxIdx();
            if(idx <= maxIdx){
                return this.getOffset(idx);
            }
            return -(tapeWidth - viewfinderWidth + colGap);
        } else {
            // desktop
            maxIdx = this.getMaxIdx();
            if(idx <= maxIdx){
                return this.getOffset(idx);
            }
            return this.getOffset(maxIdx);
        }
    }
    // ----- move methods -----
    /**
     * Смещает ленту по указанному индексу
     * @param {Integer} idx индекс, на который нужно сместить ленту
     */
    moveTape(idx){
        let offset = this.alignTape(idx);
        const self = this;
        window.requestAnimationFrame(()=>{
            self.tape.style.transform = "translateX(" + offset + "px)";
        });
    }
    // ----- Handlers -----
    /**
     * Установка обработчиков событий
     */
    setHandlers(){
        // отменя стандартной реакции при клике по ссылкам
        this.gallery.addEventListener('click', (e)=>{
            e.preventDefault();
        });

        // клик по preview картинке
        const smallImgClickHandler = this.smallImgClickHandler.bind(this);
        this.gallery.addEventListener('click', smallImgClickHandler);

        const resizeHandler = this.resizeHandler.bind(this);
        window.addEventListener('resize', resizeHandler);

        const touchStartHandler = this.touchStartHandler.bind(this);
        this.gallery.addEventListener('touchstart', touchStartHandler);

        const touchMoveHandler = this.touchMoveHandler.bind(this);
        this.gallery.addEventListener('touchmove', touchMoveHandler);

        const touchEndHandler = this.touchEndHandler.bind(this);
        this.gallery.addEventListener('touchend', touchEndHandler);

    }
    /**
     * Обработчик клика по маленькой картинке галереи
     * @param {Event} event объект события
     */
    smallImgClickHandler(event){
        let target = event.target;
        target = target.closest('.' + this.cssNames.tapeItem);

        if(target !== null){
            const itemIdx = this.getTapeItemIdx(target);
            if(itemIdx != -1)
                this.popupGallery.openPopupGallery(itemIdx);
        }
    }
    /**
     * Обработчик resize события
     * @param {Event} event объект события
     */
    resizeHandler(event){
        if(this._getViewportWidth() <= 767){
            // mobile
            this.moveTape(this.mobileOffset);
        } else {
            //desktop
            this.moveTape(this.desktopOffset);
        }
    }
    /**
     * обработчик touchstart события для галереи
     * @param {Event} ev объект события
     */
    touchStartHandler(ev){
        let target = ev.target;
        target.closest('.' + this.cssNames.tape);
        if(target !== null){
            let touchObj = ev.changedTouches[0];
            this.touchSettings.dist = 0;
            this.touchSettings.startX = touchObj.pageX;
            this.touchSettings.startY = touchObj.pageY;
            this.touchSettings.startTime = new Date().getTime();

            let pointerBox = self.gallery.querySelector('.' + this.cssNames.pointerBox);
            window.requestAnimationFrame(()=>{
                pointerBox.style.display = "none";
            });
            
        }
    }
    /**
     * обработчик touchmove события для галереи
     * @param {Event} ev объект события
     */
    touchMoveHandler(ev){
        let target = ev.target;

        target = target.closest('.' + this.cssNames.tape);
        if(target !== null){
            ev.preventDefault();
        }
    }
    /**
     * обработчик touchend события для галереи
     * @param {Event} ev объект события
     */
    touchEndHandler(ev){
        let target = ev.target;

        target.closest('.' + this.cssNames.tape);
        if(target !== null){
            let touchObj = ev.changedTouches[0];
            
            this.touchSettings.dist = touchObj.pageX - this.touchSettings.startX;
            this.touchSettings.elapsedTime = new Date().getTime() - this.touchSettings.startTime;

            const toRight = (this.touchSettings.elapsedTime <=  this.touchSettings.allowedTime && this.touchSettings.dist >= this.touchSettings.threshold && Math.abs(touchObj.pageY - this.touchSettings.startY) <= this.touchSettings.yDeviationHold);
            const toLeft = (this.touchSettings.elapsedTime <=  this.touchSettings.allowedTime && this.touchSettings.dist < 0 && Math.abs(this.touchSettings.dist) >= this.touchSettings.threshold && Math.abs(touchObj.pageY - this.touchSettings.startY) <= this.touchSettings.yDeviationHold);

            if(this._getViewportWidth() <= 767){
                // mobile
                
                // всего картинок
                const totalImgs = this.tape.querySelectorAll('.' + this.cssNames.tapeItem).length;
                
                let currentOffsetIdx = this.mobileOffset;
                if(toRight){
                    currentOffsetIdx--;
                    
                    if(currentOffsetIdx <= 0){
                        this.mobileOffset = 0;
                    } else {
                        this.mobileOffset = currentOffsetIdx;
                    }
                } 
                if(toLeft){
                    currentOffsetIdx++;

                    if(currentOffsetIdx >= (totalImgs-1)){
                        this.mobileOffset = totalImgs-1; 
                    } else {
                        this.mobileOffset = currentOffsetIdx;
                    }
                }

                this.moveTape(this.mobileOffset);
            } else {
                // desktop
                // всего колонок
                let totalCols = this.getСolsСount();
                // текущий индекс смещения
                let currentOffsetIdx = this.desktopOffset;
                if(toRight){
                    currentOffsetIdx--;

                    if(currentOffsetIdx <= 0){
                        this.desktopOffset = 0;
                    } else {
                        this.desktopOffset = currentOffsetIdx;
                    }
                } 
                if(toLeft){
                    currentOffsetIdx++;
                    if(currentOffsetIdx >= totalCols){
                        this.desktopOffset = totalCols-1;
                    } else {
                        this.desktopOffset = currentOffsetIdx;
                    }
                }
                this.moveTape(this.desktopOffset);
            }
        }
    }
    // ----- get methods -----
    /**
     * Возвращает количество колонок в grid сетке галереи
     * @returns {Integer} количество колонок
     */
    getСolsСount(){
        const tapeStyle = window.getComputedStyle(this.tape);
        const gridTemplateColumns = tapeStyle.gridTemplateColumns;
        const cols = gridTemplateColumns.split(' ');
        return cols.length;
    }
    /**
     * Возвращает индекс элемента ленты preview картинок
     * @param {HTMLElement} item элемент ленты
     * @returns {Integer} индекс элемента item ленты preview картинок или -1, если ничего не нашел
     */
    getTapeItemIdx(item){
        const tape = item.parentNode;
        const items = tape.querySelectorAll('.' + this.cssNames.tapeItem);

        for(let i = 0; i < items.length; i++){
            if(items[i] == item) return i;
        }
        return -1;
    }
    /**
     * Возвращает смещение ленты для позиционирования на "слайде" с индексом idx
     * @param {Integer} idx индекс "слайда"
     * @returns {Float} смещение ленты от левого края контейнера
     */
    getOffset(idx){
        // стили ленты
        const tapeStyle = window.getComputedStyle(this.tape);
        // стили элемента ленты
        const itemStyle = window.getComputedStyle(this.tape.getElementsByClassName(this.cssNames.tapeItem)[0]);

        let colGap = parseFloat(tapeStyle.columnGap);
        let itemWidth = parseFloat(itemStyle.width);
        
        return -idx * (itemWidth + colGap);
    }
    /**
     * Возвращает текущее значение ширины viewport
     * @returns {Float} ширина viewport
     */
    _getViewportWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }
    /**
     * Возвращает максимально возможный позиционный индекс ленты галереи
     * учитывая текущее разрешение экрана
     */
    getMaxIdx(){
        // стили ленты
        const tapeStyle = window.getComputedStyle(this.tape);
        // стили элемента ленты
        const itemStyle = window.getComputedStyle(this.tape.getElementsByClassName(this.cssNames.tapeItem)[0]);
        // стили контейнера ленты
        const viewfinderStyle = window.getComputedStyle(this.tapeBox);
        // стили псевдо-элемента, закрывающего часть картинок справа    
        const grdtBoxStyle = window.getComputedStyle(this.tapeBox,':after'); 
        
        
        // ширина элемента ленты
        let itemWidth = parseFloat(itemStyle.width);
        // отступы между элементами
        let colGap = parseFloat(tapeStyle.columnGap);
        // ширина ленты
        let tapeWidth = parseFloat(tapeStyle.width) + colGap;
        // ширина контейнера ленты
        let viewfinderWidth = parseFloat(viewfinderStyle.width) - parseFloat(viewfinderStyle.paddingLeft) - parseFloat(viewfinderStyle.paddingRight);
        // ширина декоративного градиента, закрывающего часть картинок справа    
        let grdtBoxWidth = parseFloat(grdtBoxStyle.width);
        // максимально допустимый индекс смещения ленты
        let maxIdx = 0;

        if(this._getViewportWidth() <= 767){
            // mobile
            maxIdx = (tapeWidth - viewfinderWidth) / (itemWidth + colGap);
        } else {
            // desktop
            maxIdx = (tapeWidth - viewfinderWidth + grdtBoxWidth) / (itemWidth + colGap);
        }
        maxIdx = Math.round(maxIdx);
        return maxIdx; 
    }
}

const gallery = new Gallery('gallery');