import './img/slider-images.js'

class Slider{
    constructor(sliderId){
        this.cssNames = {
            sliderBox: 'slider-box',
            title: 'slider-box__title',
            viewfinder: 'tape-hiding-box',
            tape: 'tape-hiding-box__tape',
            tapeItem: 'tape-hiding-box__tape-item',
            activeTapeItem: 'tape-hiding-box__tape-item_active',
            descriptionBox: 'description-box',
            descriptionList: 'list-box',
            descriptionItem: 'item-box',
            activeDescriptionItem: 'list-box__item-box_active',
            controlBox: 'slider-box__control',
            controlItem: 'slider-box__control-item',
            activeControlItem: 'slider-box__control-item_active'
        };
        this.slider = document.querySelector('#' + sliderId);
        this.viewFinder = this.slider.querySelector('.' + this.cssNames.viewfinder);
        this.tape = this.viewFinder.querySelector('.' + this.cssNames.tape);
        this.tapeItem = this.tape.querySelector('.' + this.cssNames.tapeItem);
        this.descList = this.slider.querySelector('.' + this.cssNames.descriptionList);
        this.controlBox = this.slider.querySelector('.' + this.cssNames.controlBox);

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

        
        this.setHandlers();
    }
    // ----- handlers -----
    /**
     * Обработчик клика по пунктам списка описаний слайдов
     * @param {Event} ev объект события
     */
    clickItemsHandler(ev){
        let target = ev.target;
        // пункт списка (блок <li>)
        target = target.closest('.' + this.cssNames.descriptionItem);

        if(target !== null){
            const nextIdx = this.getCurrentIdx(target);
            this.clearActivity();
            
            const self = this;
            window.requestAnimationFrame(()=>{
                self.setActivity(nextIdx);
            });
        }
    }
    /**
     * обработчик touchstart события слайдера
     * @param {Event} ev объект события
     */
    touchStartHandler(ev)
    {
        let target = ev.target;
        target = target.closest('.' + this.cssNames.sliderBox);

        if((target !== null) && (this._getViewportWidth() <= 767)){
            let touchobj = ev.changedTouches[0];
            this.touchSettings.dist = 0;
            this.touchSettings.startX = touchobj.pageX;
            this.touchSettings.startY = touchobj.pageY;
            this.touchSettings.startTime = new Date().getTime();
        }
    }
    /**
     * обработчик touchmove события на ленте галереи
     * @param {Event} ev объект события
     */
    touchMoveHandler(ev){
        let target = ev.target;
        target = target.closest('.' + this.cssNames.sliderBox);

        if((target !== null) && (this._getViewportWidth() <= 767)){
            // ev.preventDefault();
        }
    }
    /**
    * обработчик touchend события на ленте галереи
    * @param {Event} ev объект события
    */
    touchEndHandler(ev){
        let target = ev.target;
        target = target.closest('.' + this.cssNames.sliderBox);

        if((target !== null) && (this._getViewportWidth() <= 767)){
         
            let touchobj = ev.changedTouches[0];
            this.touchSettings.dist = touchobj.pageX - this.touchSettings.startX;
            this.touchSettings.elapsedTime = new Date().getTime() - this.touchSettings.startTime;
            
            const toRight = (this.touchSettings.elapsedTime <=  this.touchSettings.allowedTime && this.touchSettings.dist >= this.touchSettings.threshold && Math.abs(touchobj.pageY - this.touchSettings.startY) <= this.touchSettings.yDeviationHold);
            const toLeft = (this.touchSettings.elapsedTime <=  this.touchSettings.allowedTime && this.touchSettings.dist < 0 && Math.abs(this.touchSettings.dist) >= this.touchSettings.threshold && Math.abs(touchobj.pageY - this.touchSettings.startY) <= this.touchSettings.yDeviationHold);

            const self = this;
            const totalSlides = this.getSlidesCount();
            const activeIdx = this.getActiveIdx();
            if(toRight){
                // свайп вправо
                // if( (activeIdx - 1) < 0 ) return;
                const newActiveIdx = activeIdx - 1 < 0 ? activeIdx - 1 + totalSlides: activeIdx - 1;
                
                window.requestAnimationFrame(()=>{
                    self.moveSlidesTape(newActiveIdx);
                    self.moveControlElement(newActiveIdx);
                    self.moveDescriptionItem(newActiveIdx)
                });
                
            } 
            if(toLeft){
                // свайп влево

                // if( (activeIdx + 1) >= totalSlides) return;
                const newActiveIdx = activeIdx + 1 >= totalSlides  ? 0: activeIdx + 1;

                window.requestAnimationFrame(()=>{
                    self.moveSlidesTape(newActiveIdx);
                    self.moveControlElement(newActiveIdx);
                    self.moveDescriptionItem(newActiveIdx)
                });
            }
        }
    }

    // ----- set methods ----- 
    /**
     * Устанавливает обработчики событий
     */
    setHandlers(){
        const clickItemsHandler = this.clickItemsHandler.bind(this);
        this.slider.addEventListener('click', clickItemsHandler);

        const touchStartHandler = this.touchStartHandler.bind(this);
        this.slider.addEventListener('touchstart', touchStartHandler);
        
        const touchMoveHandler = this.touchMoveHandler.bind(this);
        this.slider.addEventListener('touchmove', touchMoveHandler);

        const touchEndHandler = this.touchEndHandler.bind(this);
        this.slider.addEventListener('touchend', touchEndHandler);

        const showCurrentActiveSlide = this.showCurrentActiveSlide.bind(this);
        window.addEventListener('resize', (e) => { /*console.log('window resize --->');*/ showCurrentActiveSlide(); });
    }
    /**
     * Устанавливает классы активности у всех необходимых элементов
     * @param {Integer} idx индекс элементов, у которых нужно установить класс активности
     */
    setActivity(idx){
        this.descList.children[idx].classList.add(this.cssNames.activeDescriptionItem);
        this.controlBox.children[idx].classList.add(this.cssNames.activeControlItem);
        this.tape.children[idx].classList.add(this.cssNames.activeTapeItem);
    }
    // ----- get methods ----- 
    /**
     * Возвращает индекс "активного" слайда
     * @returns {Number} индекс слайда или -1 если его нет
     */
    getActiveIdx(){
        const activeSlide = this.tape.querySelector('.' + this.cssNames.activeTapeItem);
        if(activeSlide) return this.getCurrentIdx(activeSlide);
        throw new Error('Нет "активного" слайда');
    }
    /**
     * Возвращает индекс дочернего элемента или -1 в случае неудачи
     * @param {HTMLElement} childEl дочерний элемент
     * @returns {Integer}
     */
    getCurrentIdx(childEl){
        const parent = childEl.parentNode;
        const childs = parent.children;

        for(let i = 0; i < childs.length; i++){
            if(childs[i] == childEl){
                return i;
            }
        }
        return -1;

    }
    /**
     * Возвращает количество слайдов
     * @returns {Number} количество слайдов
     */
    getSlidesCount(){
        return this.tape.querySelectorAll('.' + this.cssNames.tapeItem).length;
    }
    /**
     * Определяет смещение ленты 
     * при установке на слайд с индексом idx
     * @param {Number} idx индекс слайда
     * @returns {Float} смещение ленты в px
     */
    getSlideOffset(idx){
        // определить ширину слайда
        // результат это idx * ширина слайда
        return this.getSlideWidth() * idx;
    }
    /**
     * Возвращает ширину слайда
     * @returns {Float} ширина слайда в px
     */
    getSlideWidth(){
        let slide = this.tape.querySelector('.' + this.cssNames.tapeItem);
        let slideStyle = window.getComputedStyle(slide);

        return parseFloat(slideStyle.width);
    }
    /**
     * Возвращает текущее значение ширины viewport
     * @returns {Float} ширина viewport
     */
    _getViewportWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }
    // ----- clear metods -----
    /**
     * Удаляет классы активности у всех необходимых элементов
     */
    clearActivity(){
        this.clearChildClass(this.descList, this.cssNames.activeDescriptionItem);
        this.clearChildClass(this.controlBox, this.cssNames.activeControlItem);
        this.clearChildClass(this.tape, this.cssNames.activeTapeItem);
    }
    /**
     * Удаляет класс className у всех дочерних элементов parent
     * @param {HTMLElement} parent родительский элемент
     * @param {String} className удаляемый класс
     */
    clearChildClass(parent, className){
        const childs = parent.children;
        for(let i = 0; i < childs.length; i++){
            childs[i].classList.remove(className);
        }
    }
    // ----- move methods ----- 
    /**
     * Смещает ленту на слайд с индексом activeIdx,
     * если это возможно
     * @param {Number} activeIdx индекс нового активного слайда
     */
    moveSlidesTape(activeIdx){
        // определить новое смещение ленты для нового индекса
        // снять со старого и установить на новый слайд класс активности
        // сместить ленту
        let totalSlides = this.getSlidesCount();
        if(activeIdx >= totalSlides || activeIdx < 0) throw new Error('Нет такого индекса слайда');
        let newOffset = this.getSlideOffset(activeIdx);
        
        this.clearChildClass(this.tape, this.cssNames.activeTapeItem);
        this.tape.children[activeIdx].classList.add(this.cssNames.activeTapeItem);
        
        this.tape.style.transform = "translateX(-"+newOffset+"px)";
    }
    /**
     * Меняет положение индикатора активного слайда в панели индикации
     * @param {Number} activeIdx индекс нового активного слайда
     */
    moveControlElement(activeIdx){
        // снять со старого control элемента класс активности
        // установить на новый элемент control класс активности
        this.clearChildClass(this.controlBox, this.cssNames.activeControlItem);
        this.controlBox.children[activeIdx].classList.add(this.cssNames.activeControlItem);
    }
    /**
     * Меняет описание слайда при переходе к другому слайду
     * @param {Number} activeIdx индекс нового активного слайда
     */
    moveDescriptionItem(activeIdx){
        // снять со старого control элемента класс активности
        // установить на новый элемент control класс активности
        this.clearChildClass(this.descList, this.cssNames.activeDescriptionItem);
        this.descList.children[activeIdx].classList.add(this.cssNames.activeDescriptionItem);
    }
    // ----- show methods -----
    /**
     * Показывает слайдер с текущей позицией активного слайда
     */
    showCurrentActiveSlide(){
        const vw = this._getViewportWidth();
        const activeIdx = this.getActiveIdx();
        const self = this;
        if(vw > 767){
            // desktop
            window.requestAnimationFrame(()=>{
                self.setActivity(activeIdx);
                self.tape.style = '';
            });
        } else {
            // mobile
            window.requestAnimationFrame(()=>{
                self.moveSlidesTape(activeIdx);
            });
        }
    }
}

const infoSlider = new Slider('slider');

