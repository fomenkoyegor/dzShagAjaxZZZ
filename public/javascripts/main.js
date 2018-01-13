var Ajax = {
    get: function (url, onresponse) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
            onresponse(xhr.response, xhr.status, xhr.statusText);
        };
        xhr.send();
    },
    post: function (url, postparams, onresponse) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
            onresponse(xhr.response, xhr.status, xhr.statusText);
        };
        var data = new FormData();
        for (var prop in postparams) {
            data.append(prop, postparams[prop]);
        }
        xhr.send(data);
    }
};

/*var stream = Rx.Observable.fromEvent(document, 'mousemove');
stream.filter(function (e) {
    return e.clientX<window.innerWidth/2
}).subscribe(function (e) {
    console.log(e.clientX + ' : ' + e.clientY)
});*/

var page = {
    init: function () {
        this.fader.init();
        this.userList.init();
        this.nooteBook.init();
        this.info.init();
    }
};
page.fader = {
    init: function () {
        this.fader = document.querySelector('.fade');
        this.hide();
    },
    show: function () {
        this.fader.style.display = '';
    },
    hide: function () {
        this.fader.style.display = 'none';
    }
};
page.userList = {
    users: [],
    activeUser: -1,
    init: function () {
        this.container = document.querySelector('.users');
        this.form = document.forms.adduser;
        this.list = this.container.querySelector('.list');
        this.ajaxUpdate();
        this.eventAttach();
    },
    eventAttach: function () {
        this.form.addEventListener('submit', function (e) {
            e.preventDefault();
            this.appendUser(this.form.elements.name.value);
            console.log(this.form.elements.name.value)
        }.bind(this));
        this.list.addEventListener('click', function (e) {
            if (e.target.matches('.delete')) this.delUser(e.target.dataset.id);
            if (e.target.matches('.details')) this.selectUser(e.target.dataset.id);

        }.bind(this))
    },
    createItem: function (user) {
        var item = document.createElement('DIV');
        var delbtn = document.createElement('DIV');
        var details = document.createElement('DIV');

        delbtn.dataset.id = user.id;
        details.dataset.id = user.id;

        item.className = 'item';
        delbtn.className = 'delete';
        details.className = 'details';

        if (user.id == this.activeUser) item.classList.add('active');

        item.insertAdjacentText("afterBegin", user.name);
        item.appendChild(delbtn);
        item.appendChild(details);
        return item;
    },
    ajaxUpdate: function () {
        page.fader.show();
        Ajax.get("//pdfstep.zzz.com.ua?action=user&method=getAll", function (response) {
//             response = response != "" ? $.parseJSON(response) : {};
//             this.users = JSON.parse(response).data;
            this.users= response != "" ? $.parseJSON(response) : {};
            this.redraw();
            page.fader.hide();
            console.log(response)
        }.bind(this))
    },
    redraw: function () {
        this.list.innerHTML = '';
        var fragment = document.createDocumentFragment();
        this.users.forEach(function (user) {
            fragment.appendChild(this.createItem(user));
        }.bind(this));
        this.list.appendChild(fragment);
    },
    appendUser: function (name) {
        page.fader.show();
        Ajax.post("//pdfstep.zzz.com.ua?action=user&method=add", { name: name }, function (response) {
            console.log(response);
            this.ajaxUpdate();
        }.bind(this))
    },
    delUser: function (id) {
        page.fader.show();
        Ajax.post("//pdfstep.zzz.com.ua?action=user&method=del", { id: id }, function (response) {
            console.log(response);
            this.ajaxUpdate();
        }.bind(this))
    },
    selectUser: function (id) {
        this.activeUser = id;
        this.redraw();
    }
};
page.nooteBook = {
    notes: [],
    activeUserNotes: -1,
    init: function () {
        this.container = document.querySelector(".notes");
        this.notesName = document.querySelector(".notesName");
        this.list = this.container.querySelector('.list');
        this.form = document.forms.addnotes;

        page.userList.container.addEventListener('click', (e) => {
            if (e.target.matches(".details")) {
                this.form.elements.name.dataset.id = e.target.dataset.id;
                this.ajaxUpdateNotes(this.form.elements.name.dataset.id)
                /* this.getNotes(e.target.dataset.id); */

                /* this.form.elements.name.dataset.name=e.target.parentNode.textContent; */

            }
        });
        this.eventAttach();
    },
    eventAttach: function () {
        this.form.addEventListener('submit', function (e) {
            e.preventDefault();
            this.ajaxUpdateNotes(this.form.elements.name.dataset.id)

            //  this.appendNotes(this.form.elements.name.value); 
            /* console.log(this.form.elements.name.value) */
            this.appendNotes(
                this.form.elements.name.dataset.id,
                this.form.elements.name.value,
                this.form.elements.desc.value
            )

        }.bind(this));
        this.list.addEventListener('click', (e) => {
            if (e.target.matches('.delete')) this.delNotes(e.target.dataset.id);
            /*  if (e.target.matches('.details')){
                 this.selectNotes(e.target.dataset.id);
 
             }  */
        })

    },

    ajaxUpdateNotes: function (id) {

        Ajax.post("//pdfstep.zzz.com.ua?action=todo&method=get", { id: id }, function (response) {
            this.notes = JSON.parse(response).data;
            this.redraw();


        }.bind(this))
    },

    redraw: function () {
        this.list.innerHTML = '';
        var fragment = document.createDocumentFragment();
        this.notes.forEach(function (user) {
            fragment.appendChild(this.createItem(user));
        }.bind(this));
        this.list.appendChild(fragment);
    },
    createItem: function (user) {
        var item = document.createElement('DIV');
        var delbtn = document.createElement('DIV');
        var details = document.createElement('DIV');

        delbtn.dataset.id = user.id;
        details.dataset.id = user.id;

        item.className = 'item';
        delbtn.className = 'delete';
        details.className = 'details';

        if (user.id == this.activeUserNotes) item.classList.add('activeNotes');

        item.insertAdjacentText("afterBegin", user.name);
        item.appendChild(delbtn);
        item.appendChild(details);
        return item;
    },

    getNotes: function (id) {
        Ajax.post("//pdfstep.zzz.com.ua?action=todo&method=get", { id: id }, function (response) {

            this.notes = JSON.parse(response).data;

            console.log(response, id, this.notes)

        }.bind(this))
    },
    appendNotes: function (id, name, desc) {

        Ajax.post("//pdfstep.zzz.com.ua?action=todo&method=add", { id: id, name: name, desc: desc }, function (response) {
            console.log(response);
            this.ajaxUpdateNotes(this.form.elements.name.dataset.id)
        }.bind(this))
    },
    delNotes: function (id) {
        Ajax.post("http://pdfstep.zzz.com.ua?action=todo&method=delete", { id: id }, function (response) {

            this.ajaxUpdateNotes(this.form.elements.name.dataset.id)

        }.bind(this))
    },
    selectNotes: function (id) {
        this.activeUserNotes = id;
        this.redraw();
    }

}
page.info = {
    init: function () {
        this.container = document.querySelector(".details");
        this.infoNotes = this.container.querySelector(".infoNotes");
        this.infoDesc = this.container.querySelector(".infoDesc");

        page.nooteBook.list.addEventListener('click', (e) => {
            if (e.target.matches('.details')) {
                page.nooteBook.selectNotes(e.target.dataset.id);
                /* this.infoNotes.textContent = e.target.parentNode.textContent; */

                /* a.filter(function (elem) {return elem%3==0;  }) */
                console.log(page.nooteBook.notes);
                page.nooteBook.notes.forEach(function (entry) {
                    var id = e.target.dataset.id;
                    /*  console.log(entry,id) */
                    /* for (var key in entry) {
                        
                        if (entry.id == id) this.infoDesc.innerHTML = entry.desk;

                    } */

                    for (var key in entry) {
                        if (id == entry.id) {
                            this.infoDesc.textContent = entry.desc;
                            this.infoNotes.textContent = entry.name;

                        }
                        /* console.log(entry,id) */

                    }
                }.bind(this))



            }
        })
    }
}


window.addEventListener('load', function () {
    page.init()
});
