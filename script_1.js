function move(self) {
            self.dataTransfer.setData('text/plain', self.target.outerHTML);
        }
        
        function drop(self) {
            self.preventDefault();
            
            let html = self.dataTransfer.getData('text/plain');
            let temp = document.createElement('div');
            temp.innerHTML = html;
            let new_block = temp.firstChild;
                       
            let target = self.target;
            
            if (target.id == 'block_zone') {
                target.appendChild(new_block);
            }
            else {
                let box = document.createElement('div');
                box.style.marginLeft = '20px';
                box.appendChild(new_block);
                target.appendChild(box);
            }
        }       