class CreateMobileMenu{
    constructor(menuId){
        this.menuBox = document.querySelector('#' + menuId);
        this.cssNames = {
            mobileClick: 'nav-box_mobile-active',
            mobileButton: 'nav-box__mobile-menu-btn',
        }
        this.setHandlers();
    }
    /**
     * Устанавливает обработчики для событий меню
     */
    setHandlers(){
        const openMenuHandler = this.openMenuHandler.bind(this);
        this.menuBox.addEventListener('click', openMenuHandler);
        document.body.addEventListener('click', openMenuHandler);
    }
    /**
     * Открывает и отключает меню при клике по кнопке-гамбургеру
     * @param {Event} ev объект события
     */
    openMenuHandler(ev){
        let target = ev.target;
        target = target.closest("." + this.cssNames.mobileButton);
        const self = this;

        if(target!==null){
            if(this.menuBox.classList.contains(this.cssNames.mobileClick)){
                window.requestAnimationFrame(()=>{
                    self.menuBox.classList.remove(self.cssNames.mobileClick)
                });   
            } else {
                window.requestAnimationFrame(()=>{
                    self.menuBox.classList.add(self.cssNames.mobileClick)
                });
            }
        } else {
            window.requestAnimationFrame(()=>{
                self.menuBox.classList.remove(self.cssNames.mobileClick)
            });
        }
    }
}

const topMenu = new CreateMobileMenu('nav-box-js');

// target = target.closest("." + this.cssNames.ImgsTapeItem);
        
//         if(target !== null){
//             // узнать индекс элемента в псевдомассиве preview картинок
//             const itmIdx = this.getImgItemIndex(target);
//             // открыть галерею на картинке с индексом itmIdx
//             if(itmIdx != -1) this.openPopupGallery(itmIdx);
//         }