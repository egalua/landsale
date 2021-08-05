/**
 * Создаёт прилипшее к низу окно 
 * и выводит туда сообщения лога
 */
class Log{
    constructor(){
        this.logArea = document.createElement('div');
        this.logArea.style.cssText = "position: fixed; bottom: 0; left:0; right: 0; margin: auto; background-color: #cfe; min-height: 30px; max-height: 160px; overflow: auto;";
        document.body.appendChild(this.logArea);
    }
    /**
     * Печатает строку лога
     * @param {String} str строка лога
     */
    print(str){
        const logRecord = document.createElement('div');
        logRecord.innerHTML = str;
        this.logArea.appendChild(logRecord);
        // const rec = logRecord.getBoundingClientRect();
        this.logArea.scroll(0, logRecord.offsetTop);
    }
}


/**
 * Класс кнопки, прилипающей к верхнему краю экрана
 * при скролле страницы
 */
class stickyButton{
    constructor(buttonClass){
        const self = this;
        this.cssNames = {
            stikyClass: 'call-button_sticky'
        };
        // оригинальная кнопка
        this.button = document.querySelector('.' + buttonClass);
        // клон кнопки
        this.stickyButton = this.button.cloneNode(true);
        
        this.stickyButton.classList.add(this.cssNames.stikyClass);
        document.body.appendChild(this.stickyButton);
        window.requestAnimationFrame(()=>{
            self.stickyButton.style.display = 'none';
        });
        
        this.setHandlers();

    }
    // ----- handlers -----
    /**
     * Установка обработчиков событий
     */
    setHandlers(){
        const scrollHandler = this.scrollHandler.bind(this);
        window.addEventListener('scroll', scrollHandler);
        window.addEventListener('resize', scrollHandler);
    }
    /**
     * Обработчик события scroll
     * @param {Event} e объект события
     */
    scrollHandler(e){
        const self = this;
        if(this._getViewportWidth() < 768){
            if( (this.button.offsetHeight + this.button.getBoundingClientRect().top) < 0){
                window.requestAnimationFrame(()=>{
                    self.stickyButton.style.display = '';
                });
            } else {
                window.requestAnimationFrame(()=>{
                    self.stickyButton.style.display = 'none';
                });
            }
        }
    }
    // ------ get methods -----
    /**
     * Возвращает текущее значение ширины viewport
     * @returns {Float} ширина viewport
     */
    _getViewportWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
}

const btn = new stickyButton('call-button');