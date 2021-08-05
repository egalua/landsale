export default class UserAgreement{
    constructor(closeButtonClass = 'text-content__close-button', userAgreementId = 'user-agreement', userAgreementLinkClass = 'form__user-agreement', displayControlClass = 'user-agreement-wrapper_active'){
        // идентификатор блока с пользовательским соглашением
        this.blockId = '#' + userAgreementId;
        // css класс ссылки, открывающей пользовательское соглашение
        this.linkClass = '.' + userAgreementLinkClass;
        // css класс кнопки "закрыть" окна с пользовательским соглашением
        this.closeBtnClass = '.' + closeButtonClass;
        // ссылка, открывающей пользовательское соглашение
        this.userAgreementLink = document.querySelector(this.linkClass);
        // пользовательское соглашение
        this.userAgreement = document.querySelector(this.blockId);
        // кнопка, закрывающая пользовательское соглашение
        this.closeButton = this.userAgreement.querySelector(this.closeBtnClass);
        // класс, управляющий отображением пользовательского соглашения
        this.displayControlClass = displayControlClass;

        this.setHandlers();
    }
    // ------------ Handlers ------------
    /**
     * Обработчик загрузки страницы с пользовательским соглашением
     * @param {Event} event объект события
     */
    loadWindowHandler(event){
        const href = window.location.href;
        if(href.indexOf(this.blockId) != -1){
            if(!this.userAgreement.classList.contains(this.displayControlClass)){
                this.userAgreement.classList.add(this.displayControlClass);
            }
        }
    }
    /**
     * Обработчик клика по ссылке на пользовательское соглашение
     * @param {Event} event объект события
     */
    userAgreementLinkHandler(event){
        event.preventDefault();
        if(!this.userAgreement.classList.contains(this.displayControlClass)){
            this.userAgreement.classList.add(this.displayControlClass);
        }
    }
    /**
     * Обработчик клика по кнопке "закрыть" пользовательского соглашения
     * @param {Event} event объект события
     */
    closeButtonHandler(event){
        // нужно удалить "/#user-agreement" из window.location
        if(this.userAgreement.classList.contains(this.displayControlClass)){
            this.userAgreement.classList.remove(this.displayControlClass);
        }
        
        let href = window.location.href;
        
        if(href.indexOf(this.blockId) !== -1){
            href = href.replace(this.blockId, '');
            window.location.href = href;
        }
        
    }
    setHandlers(){
        const loadWindowHandler = this.loadWindowHandler.bind(this);
        const userAgreementLinkHandler = this.userAgreementLinkHandler.bind(this);
        const closeButtonHandler = this.closeButtonHandler.bind(this);

        window.addEventListener('load', loadWindowHandler);
        this.userAgreementLink.addEventListener('click', userAgreementLinkHandler);
        this.closeButton.addEventListener('click', closeButtonHandler);
    }
}

