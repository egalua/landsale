export default class PopupGallery{
    /**
     * Конструктор класса PopupGallery - 
     * создаёт клон блока галереи с классом className  
     * и размещает его в <body>
     * @param {String} className имя класса исходного блока с галереей
     * @param {String} cloneClassName имя класса для клонированного блока с галереей
     */
    constructor(className, cloneClassName = 'galleryBoxClone-js'){
        // имена классов основных элементов галереи
        this.cssNames = { 
            // контейнер с большой картинкой и лентой preview
            commonImgsBox: 'img-contents',
            // Контейнер с кнопками управления и большой картинкой 
            LargeImgsBox: 'img-contents__control-box',
            // Контейнер с большой картинкой и счетчиком
            LargeImgsBoxContent: 'img-contents__large-img-box',
            // левая кнопка рядом с большой картинкой
            LargeImgToLeft: 'img-contents__to-left',
            // правая кнопка рядом с большой картинкой
            LargeImgToRight: 'img-contents__to-right',
            // img-contents__closeBtn
            PopupCloseBtn: 'img-contents__closeBtn',
            // Поле счетчика, показывает номер текущей активной картинки 
            FotoCounter: 'img-contents__foto-counter',
            // контейнер для ленты preview картинок и кнопок управления
            TapeWrapper: 'img-contents__imgs-tape-wrapper',
            // контейнер - окно просмотра для ленты с preview картинками
            TapeViewfinder: 'img-contents__imgs-tape-hidden-box',
            // левая кнопка ленты с preview картинками
            TapeToLeft: 'img-contents__tape-to-left',
            // правая кнопка ленты с preview картинками
            TapeToRight: 'img-contents__tape-to-right',
            
            // лента preview картинок
            ImgsTape: 'img-contents__imgs-tape',
            // элемент ленты preview картинок
            ImgsTapeItem: 'img-contents__imgs-tape-item',
            // активный элемент ленты preview картинок
            ImgsTapeItemActive: 'img-contents__imgs-tape-item_active',
            // ссылка на large вариант preview картинки
            LargeImgLink: 'img-contents__large-img-link',
            // Большая картинка (тег <img>)
            LargeImg:'img-contents__large-img',
            // маленькая картинка (preview картинка)
            SmallImg: 'img-contents__small-img',
            // контейнер для "всплывающей" галереи, по умолчанию 'galleryBoxClone-js'
            GalleryBoxClone: 'galleryBoxClone-js',
            // preloader для большой картинки
            Preloader: 'img-contents__large-img-preloader'
        };
        // суффиксы файлов картинок в зависимости от диапазона разрешений экрана
        this.filesSuffixes = [
            {
                range: {
                    min: 0,
                    max: 320
                },
                suffix: '_320px'
            },
            {
                range: {
                    min: 320,
                    max: 420
                },
                suffix: '_420px'
            },
            {
                range: {
                    min: 420,
                    max: 768
                },
                suffix: '_768px'
            },
            {
                range: {
                    min: 768,
                    max: 1024
                },
                suffix: '_1024px'
            },
            {
                range: {
                    min: 1024,
                    max: 1440
                },
                suffix: '_1440px'
            },
            {
                range: {
                    min: 1440,
                    max: Infinity
                },
                suffix: '_1920px'
            }
        ];
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
        // основной контейнер галереи (css класс images-box)
        this.gallery = document.querySelector('.' + className);
        
        this.cssNames.GalleryBoxClone = cloneClassName;
        
        // создать галерею 
        this.createPopupGallery();
        
        // устанавливает ссылки на картинки подходящего размера
        this.setPopupImgLinks();

        // установить обработчики событий
        this.setHandlers();
    }
    // ------- Handlers -------
    /**
     * Метод устанавливает обработчики для разных событий
     */
    setHandlers(){
        // большая картинка
        const largeImg = this.popupGallery.querySelector('.' + this.cssNames.LargeImg);
        const self = this;
        
        // установка обработчика окончания загрузки большой картинки
        largeImg.addEventListener('load', (ev) => {
            // код для отключения preload анимации
            const target = ev.target;
            
            window.requestAnimationFrame(()=>{
                target.style.display = '';
            });
        });
        
        // "наблюдатель" за большой картинкой
        const largeImgObserv = new MutationObserver((mutRec)=>{ 
            // код для включения preload анимации
            // большая картинка
            const largeImg = self.popupGallery.querySelector('.' + self.cssNames.LargeImg);
            // контейнер большой картинки
            const largeImgBox = largeImg.parentNode;
            // предыдущее значение атрибута src большой картинки
            const oldSrc = mutRec[0].target.currentSrc;
                        
            largeImgBox.style.backgroundImage = 'url(' + oldSrc + ')';
            
            window.requestAnimationFrame(()=>{
                largeImg.style = "display:none;"
            });
        });
        
        largeImgObserv.observe(largeImg, {
            attributes: true, // наблюдать за атрибутами
            attributeFilter: ['src'], // наблюдать только за src
            attributeOldValue: true // передавать и старое и новое старое значение атрибута в колбэк
        });

        // изменение размеров окна
        window.addEventListener('resize', (e)=>{
            self.showActiveItem();
        });

        // меняет большие картинки в соответствии с текущей шириной экрана
        window.addEventListener('resize', (e)=>{
            self.setPopupImgLinks();
        });

        // отмена стандартой реакции клика по ссылкам
        this.popupGallery.addEventListener('click', (e)=>{
            e.preventDefault();
        });
        
        // обработчик клика по preview картинке из ленты
        const smallImgClickHandler = this.smallImgClickHandler.bind(this);
        this.popupGallery.addEventListener('click', smallImgClickHandler);
        
        // обработчик закрытия всплывающей галереи (close)
        const closeHandler = this.closeHandler.bind(this);
        this.popupGallery.addEventListener('click', closeHandler);
        
        // обработчик нажатия на правую кнопку рядом с большой картинкой
        const nextImgHandler = this.nextImgHandler.bind(this);
        this.popupGallery.addEventListener('click', nextImgHandler);
        
        // обработчик нажатия на левую кнопку рядом с большой картинкой
        const prevImgHandler = this.prevImgHandler.bind(this);
        this.popupGallery.addEventListener('click', prevImgHandler);
        
        // обработчик нажания на левую кнопку ленты preview картинок
        const toLeftTapeHandler = this.toLeftTapeHandler.bind(this);
        this.popupGallery.addEventListener('click', toLeftTapeHandler);
        
        // обработчик нажания на правую кнопку ленты preview картинок
        const toRightTapeHandler = this.toRightTapeHandler.bind(this);
        this.popupGallery.addEventListener('click', toRightTapeHandler);

        // обработчик touchstart события на ленте галереи
        const touchStartHandler = this.touchStartHandler.bind(this, this.cssNames.TapeViewfinder);
        this.popupGallery.addEventListener('touchstart', touchStartHandler);

        // обработчик touchmove события на ленте галереи
        const touchMoveHandler = this.touchMoveHandler.bind(this, this.cssNames.TapeViewfinder);
        this.popupGallery.addEventListener('touchmove', touchMoveHandler);

        // обработчик touchend события на ленте галереи
        const touchEndHandler = this.touchEndHandler.bind(this, this.cssNames.TapeViewfinder);
        this.popupGallery.addEventListener('touchend', touchEndHandler);

        // обработчик touchstart события на большой картинке
        const touchStartImgHandler = this.touchStartHandler.bind(this, this.cssNames.LargeImgsBoxContent);
        this.popupGallery.addEventListener('touchstart', touchStartImgHandler);


        // обработчик touchmove события на большой картинке
        const touchMoveImgHandler = this.touchMoveHandler.bind(this, this.cssNames.LargeImgsBoxContent);
        this.popupGallery.addEventListener('touchmove', touchMoveImgHandler);

        // обработчик touchend события на большой картинке
        const touchEndImgHandler = this.touchEndHandler.bind(this, this.cssNames.LargeImgsBoxContent);
        this.popupGallery.addEventListener('touchend', touchEndImgHandler);

    }
    /**
     * Обработчик клика по preview картинки из ленты
     * @param {Event} event объект события
     */
    smallImgClickHandler(event){
        let target = event.target;
        target = target.closest("." + this.cssNames.ImgsTapeItem);
        
        if(target !== null){
            // узнать индекс элемента в псевдомассиве preview картинок
            const itmIdx = this.getImgItemIndex(target);
            // открыть галерею на картинке с индексом itmIdx
            if(itmIdx != -1) this.openPopupGallery(itmIdx);
        }
    }
    /**
     * Обработчик клика по кнопке закрыть
     * @param {Event} event объект события
     */
    closeHandler(event){
        let target = event.target;

        target = target.closest('.' + this.cssNames.PopupCloseBtn);

        if(target !== null){
            this.popupGallery.style.display = "";
            document.body.style.overflow="";
        }
    }
    /**
     * Обработчик клика по правой кнопке большой картинки
     * @param {Event} event объект события
     */
    nextImgHandler(event){
        let target = event.target;

        target = target.closest('.' + this.cssNames.LargeImgToRight);
        if(target !== null){
            this.openPopupGallery(this.getNewActiveIdx(1));
        }
    }
    /**
     * Обработчик клика по левой кнопке большой картинки
     * @param {Event} event объект события
     */
    prevImgHandler(event){
        let target = event.target;

        target = target.closest('.' + this.cssNames.LargeImgToLeft);
        if(target !== null){
            this.openPopupGallery(this.getNewActiveIdx(-1));
        }
    }
    /**
     * Обработчик клика по левой кнопке ленты
     * @param {Event} event объект события
     */
    toLeftTapeHandler(event){
        let target = event.target;

        target = target.closest('.' + this.cssNames.TapeToLeft);
        if(target !== null){
            // смещение ленты влево
            this.moveTape('left');
        }
        
    }
    /**
     * Обработчик клика по правой кнопке ленты
     * @param {Event} event объект события
     */
    toRightTapeHandler(event){
        let target = event.target;

        target = target.closest('.' + this.cssNames.TapeToRight);
        if(target !== null){
            // смещение ленты вправо
            this.moveTape('right');
        }
    }
    /**
     * обработчик touchstart события на ленте галереи
     * @param {String} objClass css класс объекта, для которого устанавливается обработчик
     * @param {Event} ev объект события
     */
    touchStartHandler(objClass, ev)
    {
        let target = ev.target;
        // objClass == this.cssNames.TapeViewfinder - для ленты
        // objClass == this.cssNames.LargeImgsBoxContent - для большой картинки
        target = target.closest('.' + objClass);

        if(target !== null){
            let touchobj = ev.changedTouches[0];
            this.touchSettings.dist = 0;
            this.touchSettings.startX = touchobj.pageX;
            this.touchSettings.startY = touchobj.pageY;
            this.touchSettings.startTime = new Date().getTime();
        }
    }
    /**
     * обработчик touchmove события на ленте галереи
     * @param {String} objClass css класс объекта, для которого устанавливается обработчик
     * @param {Event} ev объект события
     */
    touchMoveHandler(objClass, ev){
        let target = ev.target;
        // objClass == this.cssNames.TapeViewfinder - для ленты
        // objClass == this.cssNames.LargeImgsBoxContent - для большой картинки
        target = target.closest('.' + objClass);

        if(target !== null){
            ev.preventDefault();
        }
    }
    /**
     * обработчик touchend события на ленте галереи
     * @param {String} objClass css класс объекта, для которого устанавливается обработчик
     * @param {Event} ev объект события
     */
    touchEndHandler(objClass, ev){
        let target = ev.target;
        // objClass == this.cssNames.TapeViewfinder - для ленты
        // objClass == this.cssNames.LargeImgsBoxContent - для большой картинки
        target = target.closest('.' + objClass);

        if(target !== null){
         
            let touchobj = ev.changedTouches[0];
            this.touchSettings.dist = touchobj.pageX - this.touchSettings.startX;
            this.touchSettings.elapsedTime = new Date().getTime() - this.touchSettings.startTime;
            
            const toRight = (this.touchSettings.elapsedTime <=  this.touchSettings.allowedTime && this.touchSettings.dist >= this.touchSettings.threshold && Math.abs(touchobj.pageY - this.touchSettings.startY) <= this.touchSettings.yDeviationHold);
            const toLeft = (this.touchSettings.elapsedTime <=  this.touchSettings.allowedTime && this.touchSettings.dist < 0 && Math.abs(this.touchSettings.dist) >= this.touchSettings.threshold && Math.abs(touchobj.pageY - this.touchSettings.startY) <= this.touchSettings.yDeviationHold);

            if(toRight){
                if(objClass == this.cssNames.TapeViewfinder){
                    this.moveTape('right');
                }
                if(objClass == this.cssNames.LargeImgsBoxContent){ 
                    this.openPopupGallery(this.getNewActiveIdx(-1));
                }
            } 
            if(toLeft){
                if(objClass == this.cssNames.TapeViewfinder){
                    this.moveTape('left');
                }
                if(objClass == this.cssNames.LargeImgsBoxContent){ 
                    this.openPopupGallery(this.getNewActiveIdx(1));
                }
            }
        }
    }
    /* ------- move methods ------- */
    /**
     * Смещает ленты на ширину блока fiewfinder (визира)
     * @param {String} dir направление смещения ленты 'right' == вправо | 'left' == влево
     */
    moveTape(dir){
        /* --------right-------- */
        // смещение ленты
        let tapeOffset = this.getTapeOffset();
        // ширина viewfinder
        let viewfinderWidth = this.getViewfinderWidth();

        if(dir == 'right'){
            // рассчитываем смещение 
            tapeOffset += viewfinderWidth;
            // выравниваем
            tapeOffset = this.alignTapeOnRight(tapeOffset);
        } 
        if(dir == 'left'){
            // рассчитываем смещение 
            tapeOffset -= viewfinderWidth;
            // выравниваем
            tapeOffset = this.alignTapeOnLeft(tapeOffset);
        }
        // применяем рассчеты
        this.setTapeOffset(tapeOffset);           

    }

    /* ------- get methods ------- */
    /**
     * Возвращает вычисленный новый индекс активной preview картинки
     * @param {Integer} modIdx величина на которую нужно изменить "активный" индекс
     * @returns {Integer} новый индекс для "активной" preview картинки
     */
    getNewActiveIdx(modIdx){
        const tape = this.popupGallery.querySelector('.' + this.cssNames.ImgsTape);
        const activeImgItem = tape.querySelector('.' + this.cssNames.ImgsTapeItemActive);
        const totalImgItems = tape.querySelectorAll('.' + this.cssNames.ImgsTapeItem).length;
        const activeIdx = this.getImgItemIndex(activeImgItem);
        
        if(modIdx < 0){
            return (totalImgItems + activeIdx + modIdx % totalImgItems) % totalImgItems;
        } else {
            return (activeIdx + modIdx) % totalImgItems;
        }
    }
    /**
     * Возвращает индекс preview картинки в ленте картинок
     * @param {HTMLElement} imgItem контейнер preview картинки
     * @returns {Number} индекс preview картинки в ленте картинок или -1 в случае ошибки
     */
    getImgItemIndex(imgItem){
        // исходный контейнер preview картинки 
        const itm = imgItem;
        // лента preview картинок
        const tape = this.popupGallery.querySelector('.' + this.cssNames.ImgsTape);
        // HTMLList из элементов ленты 
        const imgItms = tape.querySelectorAll('.' + this.cssNames.ImgsTapeItem);

        for(let i = 0; i < imgItms.length; i++){
            if(imgItms[i] == itm) return i;
        }
        return -1;
    }
    /**
     * Возвращает ширину ленты в px
     * @return {Float} ширину ленты в px
     */
    getTapeWidth(){
        const tape = this.popupGallery.querySelector('.' + this.cssNames.ImgsTape);
        const style = window.getComputedStyle(tape);

        return parseFloat(style.width);
    }
    /**
     * Возвращает смещение ленты translateX() 
     * относительно левого края viewfinder ("визира")
     * @returns {Float} смещение ленты в px
     */
    getTapeOffset(){
        const tape = this.popupGallery.querySelector('.' + this.cssNames.ImgsTape);
        const style = window.getComputedStyle(tape);
        if(style.transform != 'none'){
            const transform = style.transform.match(/(-?[0-9\.]+)/g);
            return parseFloat(transform[4]);
        }
        return 0;
    }
    /**
     * Возвращает ширину окна viewfinder ("визира")
     * @returns {Float} ширина окна визира в px
     */
    getViewfinderWidth(){
        const viewfinder = this.popupGallery.querySelector("." + this.cssNames.TapeViewfinder);

        viewfinder.style.boxSizing = 'content-box';

        const style = window.getComputedStyle(viewfinder);
        const ViewfinderWidth = parseFloat(style.width);

        viewfinder.style.boxSizing = '';

        return ViewfinderWidth;
    }
    /**
     * Возвращает позицию (смещение от начала ленты) preview картинки
     * @param {Number} - индекс картинки в ленте (если не указан, то возвращает позицию активной картинки)
     * @returns {Float} позиция preview картинки от начала ленты (если не указан индекс, то возвращает позицию активной картинки)
     */
    getItemPosition(itemNum){
        // лента
        const tape = this.popupGallery.querySelector('.' + this.cssNames.ImgsTape);
        // стили ленты
        const tapeStyles = window.getComputedStyle(tape);
        // ширина интервала между preview картинками (column-gap)
        const gapWidth = parseFloat(tapeStyles.columnGap);
        // стили контейнеров preview картинок
        const itemStyles = window.getComputedStyle(tape.querySelector('.' + this.cssNames.ImgsTapeItem));
        // ширина preview картинок (предполагается одинаковой)
        const itemsWidth = parseFloat(itemStyles.width);
        // псевдомассив HTMLElements preview картинок
        const imgItems = tape.querySelectorAll('.' + this.cssNames.ImgsTapeItem);
        // шаг смещения
        const offsetStep = gapWidth + itemsWidth;
        // искомое общее смещение
        let imageItemOffset = 0;
        // если вызов без параметор, то ищем смещение active картинки
        if(itemNum === undefined){
            for(let i = 0; i < imgItems.length; i++){
                if(!imgItems[i].classList.contains(this.cssNames.ImgsTapeItemActive)){
                    imageItemOffset += offsetStep;
                } 
                else return imageItemOffset;
            }
        }
        for(let i = 0; i < itemNum; i++){
            imageItemOffset += offsetStep;
        }
        return imageItemOffset;
    }
    /**
     * Возвращает шаг ленты -
     * расстояние от левого края картинки до левого края следующей картинки
     * @returns {Float} шаг ленты 
     */
    getTapeStep(){
        // лента
        const tape = this.popupGallery.querySelector('.' + this.cssNames.ImgsTape);
        // стили ленты
        const tapeStyles = window.getComputedStyle(tape);
        // ширина интервала между preview картинками (column-gap)
        const gapWidth = parseFloat(tapeStyles.columnGap);
        // стили контейнеров preview картинок
        const itemStyles = window.getComputedStyle(tape.querySelector('.' + this.cssNames.ImgsTapeItem));
        // ширина preview картинок (предполагается одинаковой)
        const itemsWidth = parseFloat(itemStyles.width);
        
        return gapWidth + itemsWidth;
    }
    /**
     * Возвращает ширину preview картинки
     * @returns {Float} ширина элемента ленты
     */
    getTapeItemWidth(){
        const item = this.popupGallery.querySelector('.' + this.cssNames.ImgsTapeItem);
        return parseFloat(window.getComputedStyle(item).width);
    }
    /**
     * Возвращает индекс частично видимой в viewfinder блоке картинки
     * или -1 если таковых нет
     * @param {String} direct строки "left" и "right"
     * @returns {Integer} индекс частично видимой картинки слева от viewfinder или справа
     * @param {Float} tapeOffset смещение ленты
     * @returns {Object} {leftIdx:@integer, rightIdx:@integer} - индексы слева и справа "обрезанных" элементов (==-1, если обрезанного элемента нет)
     */
    getPartlyVisImgIdx(tapeOffset){
        // индексы слева и справа "обрезанных" элементов
        let partlyVis = {leftIdx:-1, rightIdx: -1};
        // ширина viewfinder блока
        const viewfinderWidth = this.getViewfinderWidth();
        // шаг ленты
        const tapeStep = this.getTapeStep();
        // элемнтов ленты всего 
        const totalItms = this.popupGallery.querySelectorAll("." + this.cssNames.ImgsTapeItem).length;
        // ширина элемента ленты
        const tapeItemWidth = this.getTapeItemWidth();
        
        const commonLimitIdx1 = Math.abs(tapeOffset) / tapeStep;
        const commonLimitIdx2 = (Math.abs(tapeOffset) + viewfinderWidth - tapeItemWidth) / tapeStep;
        const leftMinIdx = (Math.abs(tapeOffset) - tapeItemWidth) / tapeStep;
        const rightMaxIdx = (Math.abs(tapeOffset) + viewfinderWidth) / tapeStep;


        for(let i = 0; i < totalItms; i++){
            // left
            if(i < commonLimitIdx1 && i >= leftMinIdx && i < commonLimitIdx2){
                partlyVis.leftIdx = i;
            } 
            // right
            if(i > commonLimitIdx1 && i <= rightMaxIdx && i > commonLimitIdx2){
                partlyVis.rightIdx = i;
            }
        }

        return partlyVis;
    }
    /**
     * Возвращает суффикс файлов с картинокой
     * зависящий от разрешения экрана
     * @returns {String} суффикс файла
     */
    getFileSuffix(){
        const vw = this._getViewportWidth();
        for(let i in this.filesSuffixes){
            
            if(this.filesSuffixes[i].range.min < vw && vw <= this.filesSuffixes[i].range.max){
                return this.filesSuffixes[i].suffix;
            }
        }
        return '';
    }
    /**
     * Возвращает текущее значение ширины viewport
     * @returns {Float} ширина viewport
     */
    _getViewportWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }
    /* ------- create methods ------- */
    /**
     * Создание всплывающей галереи
    */
    createPopupGallery(){
        // контейнер для всплывающей галереи
        let cloneBox = document.createElement('div');
        // оригинальный блок галереи 
        let originalImgsBox = this.gallery.querySelector('.' + this.cssNames.commonImgsBox);
        
        cloneBox.classList.add(this.cssNames.GalleryBoxClone);
        document.body.appendChild(cloneBox);
        cloneBox.appendChild(originalImgsBox.cloneNode(true));
        
        // html блок "всплывающая" галерея
        this.popupGallery = cloneBox;
    }
    /* ------- open methods ------- */
    /**
     * Открывает всплывающую галерею и
     * устанавливает открытую картинку
     * @param {Number} itemNum индекс открытой картинки
     */
    openPopupGallery(itemNum){
        this.popupGallery.style.display = "block";
        // не забыть выключить при выходе
        document.body.style.overflow="hidden";
        // установить нужную большую картинку
        this.setLargeImg(itemNum);
        // переставить класс active к нужному элементу ленты
        this.setActiveClass(itemNum);
        // установить ленту на картинку с классом active 
        this.showActiveItem();
    }
    /* ------- set methods ------- */
    /**
     * Устанавливает большую картинку, соответствующую индексу preview картинки
     * @param {Integer} itemNum номер (индекс в псевдомассиве) preview картинки
     */
    setLargeImg(itemNum){
        // большая картинка во всплывающей галерее (элемент <img>)
        const largeImg = this.popupGallery.querySelector('.'+this.cssNames.LargeImg);
        // псевдомассив HTMLElements ссылок на large вариант preview картинок из всплывающей галереи
        const largeImgsLinks = this.popupGallery.querySelectorAll('.' + this.cssNames.LargeImgLink);
        // адрес местоположения искомой большой картинки
        const largeImgSrc = largeImgsLinks[itemNum].href;
        // уснановка большой картинки
        largeImg.src = largeImgSrc;
    }
    /**
     * Устанавливает класс активности на соответствующую preview картинку
     * @param {Integer} itemNum номер (индекс в псевдомассиве) preview картинки
     */
    setActiveClass(itemNum){
        // псевдомассив активных preview картинок
        const tapeActiveItems = this.popupGallery.querySelectorAll('.' + this.cssNames.ImgsTapeItemActive);
        if(tapeActiveItems.length != 0){
            // удалить active класс у всех картинок
            for(let i = 0; i < tapeActiveItems.length; i++){
                tapeActiveItems[i].classList.remove(this.cssNames.ImgsTapeItemActive);
            }
        }
        // псевдомассив контейнеров preview картинок
        const tapeItems = this.popupGallery.querySelectorAll('.' + this.cssNames.ImgsTapeItem);
        // установить active класс у нужной
        tapeItems[itemNum].classList.add(this.cssNames.ImgsTapeItemActive);
        this.setFotoCounter(itemNum, tapeItems.length);
    }
    /**
     * Устанавливает номер показанной картинки в поле счетчика
     * @param {Number} itemNum индекс активной картинки
     * @param {Number} totalNum всего картинок
     */
    setFotoCounter(itemNum,totalNum){
        const counterBox = this.popupGallery.querySelector('.' + this.cssNames.FotoCounter);
        counterBox.innerHTML = ++itemNum + " / " + totalNum;
    }
    /**
     * Смещает ленту с помощью tranlateX()
     * @param {Float} tapeOffset новое смещение ленты
     */
    setTapeOffset(tapeOffset){
        let self = this;
        window.requestAnimationFrame(()=>{
            const tape = self.popupGallery.querySelector('.' + self.cssNames.ImgsTape);
            tape.style.transform = "matrix(1, 0, 0, 1," + tapeOffset + ", 0)";
        });
    }
    /**
     * Обновляет ссылки на большие картинки во всплывающей галерее
     * в соответствии с текущим размером экрана
     */
    setPopupImgLinks(){
        // суффикс файла соответвтвующий текущей ширине экрана
        let suffix = this.getFileSuffix();
        // регулярное выражение для замены суффикса файла
        let reg = /_\d+px/i;
        let popupGallaryLinks = this.popupGallery.querySelectorAll('.' + this.cssNames.LargeImgLink);
        
        for(let i = 0; i < popupGallaryLinks.length; i++){
            let imgHref = popupGallaryLinks[i].href;

            popupGallaryLinks[i].href = imgHref.replace(reg, suffix);
        }
    }
    /* ------- show methods ------- */
    /**
     * Показать активный блок в зоне видимости "визира"
     */
    showActiveItem(){
        // ширина ленты
        let tapeWidth = this.getTapeWidth();
        // смещение ленты относительно окна "визира"
        let tapeOffset = this.getTapeOffset();
        // ширина окна "визира"
        let viewfinderWidth = this.getViewfinderWidth();
        // позиция (смещение от начала ленты) preview картинки
        let itemPosition = this.getItemPosition();
        // шаг ленты
        let tapeStep = this.getTapeStep();

        // картинка не видна в окне Viewfinder полностью
        // itemPosition > (Math.abs(tapeOffset) + viewfinderWidth) || itemPosition < Math.abs(tapeOffset)
        if( (viewfinderWidth - itemPosition + Math.abs(tapeOffset)) < tapeStep || itemPosition < Math.abs(tapeOffset)){
            // пытаемся совместить левый край картинки и левый край «визира» 
            tapeOffset = -itemPosition; 
        }
        // наличие пустого места справа
        if( (tapeWidth - Math.abs(tapeOffset)) < viewfinderWidth ){
            // совмещаем правый край ленты с правым краем  «визира»
            tapeOffset = viewfinderWidth - tapeWidth;
        }

        // применяем новое значение tapeOffset
        this.setTapeOffset(tapeOffset);
    }
    /* ------- align methods ------- */
    /**
     * Выравнивает ленту слева - по левому краю viewfinder
     * @param {Float} tapeOffset смещение ленты, для которого нужно выполнить выравнивание
     * @returns {Float} новое значение смещения ленты
     */
    alignTapeOnLeft(tapeOffset){
        
        // текущее смещение ленты
        let currentTapeOffset = this.getTapeOffset();
        // индексы "обрезанных" элементов ленты при текущем смещении
        let currentPartlyItmIdx = this.getPartlyVisImgIdx(currentTapeOffset);
        // всего элементов в ленте
        let totalItems = this.popupGallery.querySelectorAll('.' + this.cssNames.ImgsTapeItem).length;
        // ширина ленты
        let tapeWidth = this.getTapeWidth();
        // ширина блока viewfinder
        let viewfinderWidth = this.getViewfinderWidth();

        // возможны 3 варианта:
        // 3. есть пустое пространство справа == выравниваем правую границу ленты с правой границей viewfinder
        // 1. NOT(есть обрезанный элемент справа, это последний элемент, элемент слева не обрезан)
        //    AND есть обрезанный элемент слева == выравниваем слева по обрезанному элементу (движением вправо)
        // 2. есть пустое пространство слева == выравниваем левую границу ленты слева по viewfinder

        // если лента в крайнем левом положении, т.е. выровнена по правому краю с viewfinder
        if( (currentTapeOffset + tapeWidth) == viewfinderWidth){
            return currentTapeOffset;
        }
 
        // 3. есть пустое пространство справа == выравниваем правую границу ленты с правой границей viewfinder
        if((tapeOffset + tapeWidth) < viewfinderWidth){
            tapeOffset = viewfinderWidth - tapeWidth;
        }
        
        // 1. NOT(есть обрезанный элемент справа, это последний элемент, элемент слева не обрезан)
        //    AND есть обрезанный элемент слева == выравниваем слева по обрезанному элементу (движением вправо)
        
        // индекс нового "обрезанного" слева элемента ленты 
        const clippedItemIndex = this.getPartlyVisImgIdx(tapeOffset).leftIdx;

        if( !(  (currentPartlyItmIdx.rightIdx != -1) && 
                (currentPartlyItmIdx.rightIdx == totalItems - 1) && 
                (currentPartlyItmIdx.leftIdx == -1) ) 
            &&  (clippedItemIndex != -1)
            ){
                tapeOffset = -this.getItemPosition(clippedItemIndex);
            }

        // 2. есть пустое пространство слева == выравниваем левую границу ленты слева по viewfinder
        if(tapeOffset > 0){
            tapeOffset = 0;
        }

        return tapeOffset;

    }
    /**
     * Выравнивает ленту справа - по правому краю viewfinder
     * @param {Float} tapeOffset новое смещение ленты для которого нужно выполнить выравнивание
     * @returns {Float} новое значение смещения ленты
     */
    alignTapeOnRight(tapeOffset){
        // возможны 3 варианта:
        // 2. есть пустое пространство слева == выравниваем левую границу ленты с левой границей viewfinder
        // 1. NOT(есть обрезанный элемент слева, это первый элемент, элемент справа не обрезан)
        //    AND(есть обрезанный элемент справа == выравниваем справа по обрезанному элементу (движением влево))
        // 3. есть пустое пространство справа == выравниваем правую границу ленты с правой границей viewfinder

        // текущее смещение ленты
        let currentTapeOffset = this.getTapeOffset();
        // индексы "обрезанных" элементов ленты при текущем смещении
        let currentPartlyItmIdx = this.getPartlyVisImgIdx(currentTapeOffset);
        // всего элементов в ленте
        let totalItems = this.popupGallery.querySelectorAll('.' + this.cssNames.ImgsTapeItem).length;
        // ширина ленты
        let tapeWidth = this.getTapeWidth();
        // ширина блока viewfinder
        let viewfinderWidth = this.getViewfinderWidth();
        
        
        // если лента в крайнем правом положении, т.е. выровнена по левому краю с viewfinder
        if(currentTapeOffset == 0){
            return currentTapeOffset;
        }
        
        // 2. есть пустое пространство слева == выравниваем левую границу ленты с левой границей viewfinder
        if(tapeOffset > 0){
            tapeOffset = 0;
        }
        
        // индекс нового "обрезанного" справа элемента ленты
        const clippedItemIndex = this.getPartlyVisImgIdx(tapeOffset).rightIdx;
        // 1. NOT(есть обрезанный элемент слева, это первый элемент, элемент справа не обрезан)
        //    AND(есть обрезанный элемент справа == выравниваем справа по обрезанному элементу (движением влево))
        if( !( (currentPartlyItmIdx.leftIdx != -1) && (currentPartlyItmIdx.leftIdx == 0) && (currentPartlyItmIdx.rightIdx == -1) ) && (clippedItemIndex != -1)){
            const itemWidth = this.getTapeItemWidth();
            const itemPosition = this.getItemPosition(clippedItemIndex);

            tapeOffset = viewfinderWidth - itemPosition - itemWidth;
        }
        
        // 3. есть пустое пространство справа == выравниваем правую границу ленты с правой границей viewfinder
        if((tapeOffset + tapeWidth) < viewfinderWidth){
            tapeOffset = viewfinderWidth - tapeWidth;
        }

        return tapeOffset;
    }
}


