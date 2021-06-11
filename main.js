class ToDo {
    constructor(el){
        this.root = $(el);
        this.count = 0;
        this.createToDos();
        this.createDragabled()
    }
}
ToDo.prototype.addEventListenner = function(){
    var _this = this;

    this.root.on("click",".add-new",function(){
        _this.addTask(this)
    })
    .on("click",".remove-task",function(){
        _this.removeTask(this)
    }).on("dblclick","#left",function(){
        alert("left")
    }).on("dblclick","#middle",function(){
        alert("middle")
    }).on("dblclick","#right",function(){
        alert("right")
    })
}
ToDo.prototype.removeTask = function(el){
    var _this = this;
    $.confirm({
        title:"Remove task",
        buttons: {
                remove: function () {
                    // here the button key 'hey' will be used as the text.
                    $(el).closest(".border.rounded").remove();
                    _this.saveHtml()
                },
                cancel: {
                    
                }
            }
        
    });
}
ToDo.prototype.formToDo = function(){

    var form = $("<form>")
    var left = $("<div>").addClass("col-md-6 float-left ml-0 p-0");
    var left_form = $("<div>").addClass("form-group");
    var left_form_label = $("<label>").attr("for","title").text("Title");
    var left_form_input = $("<input>").attr({"name":"title","type":"text","id":"title","placeholder":"Enter title"}).addClass("form-control")
    var right = $("<div>").addClass("col-md-6 float-left mr-0 pr-0");
    var right_form = $("<div>").addClass("form-group");
    var right_form_label = $("<label>").attr("for","deadline").text("Deadline");
    var right_form_input = $("<input>").attr({"name":"deadline","type":"datetime","id":"deadline","placeholder":"Pick deadline"}).addClass("form-control")
    var footer = $("<div>").addClass("form-group");
    var footer_label = $("<label>").attr("for","content").text("Content");
    var footer_textarea = $("<textarea>").attr({"name":"content","id":"content","placeholder":"Enter content","rows":"3"}).addClass("form-control")
    left_form.append(left_form_label).append(left_form_input)
    left.append(left_form)
    right_form.append(right_form_label).append(right_form_input)
    right.append(right_form)
    footer.append(footer_label)
    footer.append(footer_textarea)
    form.append(left).append(right).append(footer);
    
    right_form_input.datepicker({
        keyboardNavigation: false,
        forceParse: false,
        daysOfWeekDisabled: "0",
        autoclose: true,
        todayHighlight: true
    });
    return form;
}
ToDo.prototype.prompt = function(form,_title,handle){
    var _this = this;
    return $.confirm({
        columnClass: 'col-md-6',
        title: _title,
        type: 'blue',
        content: form,
        buttons: {
            formSubmit: {
                text: 'Submit',
                btnClass: 'btn-blue',
                action: function () {
                    var _data = {};
                    var isNull = false;
                    this.$content.find('input,textarea').each(function(){
                        var name = $(this).attr("name");
                        _data[name] = $(this).val()
                        var value = $(this).val();
                        if(!$(this).val()){
                            isNull = true;
                            return false;
                        } 
                    })

                    if(isNull) return false;
                    
                    handle(_data,_this)
                    _this.saveHtml()
                }
            },
            cancel: function () {
                //close
            },
        },
        onContentReady: function () {
            // bind to events
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                // if the user submits the form by pressing enter in the field.
                e.preventDefault();
                jc.$$formSubmit.trigger('click'); // reference the button and click it
            });
        }
    });
}

ToDo.prototype.addTask = function(el){
    this.prompt(this.formToDo(),"Task information",this.createTask);
    
}

ToDo.prototype.createTask = function(_data){
   
    var html = `<div class="border p-2 mb-3 rounded">
                    <div class="progress mb-2">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:5%">0%</div>
                    </div>
                    <i class="remove-task fa fa-times float-right" aria-hidden="true"></i>
                    <b>[${_data.title}]</b> <i>${_data.deadline}</i>
                    <p title="${_data.content}">
                    ${_data.content}
                    </p>
                </div>`
    
    $("#container-tasks").find("#left").append(html);
    
}
ToDo.prototype.createToDos = function(){
    var array = ['left','middle','right'];
    var _this = this;
    array.forEach(function(item){
        var html = (new Model(item)).get();
        _this.root.find("#"+item).html(html);
    })
}
ToDo.prototype.createDragabled = function(){
    var _this = this;
    this.root.find(".task-component").each(function(){
        new Sortable(this, {
            group: {
                name: 'shared',
            },
            onStart:(evt)=>{
                _this.behaviorStartTask(evt,this)
            },
            onEnd:(evt)=>{
                _this.behaviorEndTask(evt,this)
            },
            animation: 100
        });
    })
}
ToDo.prototype.behaviorStartTask = function(evt,el){
    var itemEl = evt.item;
    this.container_start = this.getStateID(itemEl);
    // behavior start
    // left
    if(this.container_start=="left")
        this.setBorderDragAble(["middle","right"])
    // middle
    if(this.container_start=="middle")
        this.setBorderDragAble(["left","right"])
    // right
    if(this.container_start=="right")
        this.setBorderDragAble(["left","middle"])
}
ToDo.prototype.LeftRight = function(){
    this.setPercent(this.itemEl,100)
}
ToDo.prototype.LeftMiddle = function(){
    this.inputPercent(this.itemEl)
}
ToDo.prototype.Rightleft = function(){
    this.setPercent(this.itemEl,0)
}
ToDo.prototype.RightMiddle = function(){
    var per = $(this.itemEl).find(".progress-bar").data("per")
    this.setPercent(this.itemEl,per)
}
ToDo.prototype.Middleleft = function(){
    this.setPercent(this.itemEl,0)
}
ToDo.prototype.setBorderDragAble = function(list_el){
    list_el.forEach(function(item){
        $("#"+item).addClass("border-dragable")
    })
}
ToDo.prototype.MiddleRight = function(){
    this.setPercent(this.itemEl,100)
}
ToDo.prototype.behaviorEndTask = function(evt,el){
    this.itemEl = evt.item;
    var container_end = this.getStateID(this.itemEl);
    
    // behavior
    // left -> middle
    if(container_end=="middle"&&this.container_start=="left") 
        this.LeftMiddle()
    // left -> right
    if(container_end=="right"&&this.container_start=="left") 
       this.LeftRight()
    // middle -> right
    if(container_end=="right"&&this.container_start=="middle") 
        this.MiddleRight()
    // middle ->left
    if(container_end=="left"&&this.container_start=="middle") 
        this.Middleleft()
    // right -> middle
    if(container_end=="middle"&&this.container_start=="right") 
        this.RightMiddle()
    // right -> left
    if(container_end=="left"&&this.container_start=="right") 
        this.Rightleft()

    this.removeBorderDragable()
    this.saveHtml(2000)
    
}
ToDo.prototype.removeBorderDragable = function(){
    var arr = ["left","middle","right"];
    arr.forEach(function(item){
        $("#"+item).removeClass("border-dragable")
    })
}
ToDo.prototype.getStateID = function(el){
    return $(el).closest(".task-component").attr("id")
}
ToDo.prototype.setPercent = function(el,per=0){
    per = per > 100 ? 100 : per;
    $(el).find(".progress-bar").html(per+"%")
    if(per==0) per = 5;
    $(el).find(".progress-bar").css({"width":per+"%",transition:"1s ease-in-out"});
    if(this.container_start=="left")
        $(el).find(".progress-bar").data("per",per);
    
}
ToDo.prototype.randomIntFromInterval = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min)
}
ToDo.prototype.formPercent = function(){
    return `<form action="" class="formName">
    <input id="percent" type="range" value="0" min="1" max="100" oninput="this.nextElementSibling.value = this.value+'%'">
    <output>0</output>
        </form>`
}
ToDo.prototype.inputPercent = function(el){
    var _this = this;
    $.confirm({
        title: 'Your percent complete!',
        content: _this.formPercent(),
        buttons: {
            formSubmit: {
                text: 'Submit',
                btnClass: 'btn-blue',
                action: function () {
                    var percent = this.$content.find('#percent').val();
                    if(percent){
                        _this.setPercent(el,percent)
                    }
                    
                }
            },
            cancel: function () {
                //close
                _this.cancelPercentForm()
            },
        },
        onContentReady: function () {
            // bind to events
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                // if the user submits the form by pressing enter in the field.
                e.preventDefault();
                jc.$$formSubmit.trigger('click'); // reference the button and click it
            });
        }
    });
}
ToDo.prototype.cancelPercentForm = function(){
    var html = $(this.itemEl).html();
    $(this.itemEl).remove();
    var wapper = $("<div>").addClass("border p-2 mb-3 rounded").html(html)
    $("#"+this.container_start).append(wapper)
}
ToDo.prototype.getRandomPercent = function(id){
    switch (id) {
        case "left":
            return randomIntFromInterval(1,15)
        case "middle":
            return randomIntFromInterval(50,80)
        default:
            return randomIntFromInterval(90,100)
    }
}
ToDo.prototype.saveHtml = function(delay=0){
    var _this = this;
    setTimeout(()=>{
        var array = ['left','middle','right']
        array.forEach(function(item){
            _this.saveCompenent(item)
        })
    },delay)
}
ToDo.prototype.saveCompenent = function(component){
    var html = this.root.find("#container-tasks").find("#"+component).html();
    var model = new Model(component);
    model.save(html)
}

class Model{
    constructor(key){
        this.key = key;
    }
}
Model.prototype.get = function(){
    var value = localStorage.getItem(this.key);
    return value;
}
Model.prototype.save = function(data){
    try {
        localStorage.setItem(this.key,data);
        return true;
    } catch (error) {
        console.log({error})
        return false;
    }
    
}
Model.prototype.delete = function(){
    try {
        localStorage.removeItem(this.key);
        return true;
    } catch (error) {
        return false;
    }
}
$(document).ready(function(){
    var td = new ToDo(".todo-wapper");
    td.addEventListenner();
})