/*
//   Created by IntelliJ IDEA.
//   User: Yves
//   Date: 2018/7/9
//   Time: 9:01

  接口:

    bgt("dom")  同jQuery

    bgt("dom").form(obj)   创建form表单  并插入至dom对象中  obj为入参 可以为对象或数组
        obj:{
            list:[          // list参数  生成form的列表参数  type：array
                {
                    name:"",  //字段名  用于向后台传输  string
                    title:"", //  form表单前的名称   选填  string
                    type:"" ,  //  可支持多个类型    1. 正常所有input的type值（number，text）  2. time  (下拉日期选择框)
                               //                    3. timeT （下拉日期时间段选择框）  4.timeHour (具体时间选择框) 5.select (下拉框 需要selectOption参数)

                    class:"",//添加class
                    created:function(input){}  form生成成功时的回调函数  回传input


                    selectOption:{      // type为select时所需要的必要参数  Object
                        url:"",     //从服务端的接口url拿到select数据  string   * url与list只能存在一个
                        params:"",  //url的参数 string/object
                        name:"", //url获取的数据的字段     比如url获取的数据为[{comName:郑州公司}]    name->comName  则下拉框每一条显示为郑州公司

                        list:[      //内置select数据 array  * url与list只能存在一个
                            {
                                name:"",
                                value:""
                            }
                        ],
                        width:"", //select的宽度,
                        search:true  //boolean
                        eachDisabled:1  //number    当两个下拉框的eachDisabled为相同数字时，  其中一个选择过后 另一个无法选择
                    }
                 }
            ]，
            success:function(params){}   //所有表单生成功的回调函数  返回所有的form表单
        }



        bgt("dom").btn({  //生成按钮  可以是对象或者数组 对象生成一个
             list:[
                {
                    name:"搜索" //按钮名称
                    glyphicon:"glyphicon-save", //bootstrap小图标
                    class:"",//添加class
                    id:"",//添加id
                    color:"btn-info",  //只支持bootstrap的类名颜色
                    created:function(btn){} 成功回调
                }
             ]
        })



        bgt.setting({   //表单配置初始化  参数可以为bootstrap table的所有接口
            url:"",
            params:"",
            columns:"", //表格的列参数  详情参考bootstrap table
            onLoadSuccess:function(){}  成功回调
        })

        bgt("dom").setTable({});  可以为bootstrap table的所有接口参数  object
        不传值则直接调用setting中的配置参数

*/
(function (win) {
    var eachDisabled = [],
        columns,
        btObj ;

    //创建ltable工厂函数
    var ltable = function (selector) {
        return new ltable.fn.init(selector);
    };

    //创建原型并指向工厂函数
    ltable.fn = ltable.prototype = {
        constructor: ltable
    };

    //构造函数
    init = ltable.fn.init = function (selector) {
        //初始化方法，this.dom 转化为jqDOM
        if (isDom(selector)) {
            this.dom = turnJqDom(selector)
        } else if (typeof selector == "string") {
            this.dom = $(selector);
        }
    };

    init.prototype = ltable.fn;

    extend(ltable.fn, {
        //form方法
        form: function (params) {
            var _this = this.dom;
            if (isArray(params)) {
                createForm(params, _this);
            } else {
                createForm([params], _this);
            }
        },
        btn:function(params){
            var _this = this.dom;
            if (isArray(params)) {
                createBtn(params, _this);
            } else {
                createBtn([params], _this);
            }
        },
        setTable:function(obj){
            var _this = this.dom;
            obj.columns ? columns = obj.columns : "";
            obj.params = obj.params ? obj.params : "";
            var url = obj.url;
            btObj= {
                url: url,
                params:obj.params,
                queryParams: function () {
                    return 'pageNumber=' + this.pageNumber + '&pageSize=' + this.pageSize
                },
                cache: false,
                striped: true,
                pagination: true,
                sidePagination: "server",
                pageNumber: 1,
                pageList: [10, 20],
                pageSize: 10,
                columns: columns ? columns :function(){console.log("请至少输入一次columns参数!")},
                onLoadSuccess:function(){
                    obj.success ? obj.success.call(_this[0],_this) : "";
                }
            };
            if(!obj){
                var data = ltable.setting.data;
                for(var key in data){
                    if(key =="url" || key =="params" ) {
                        btObj.url = data.url+"?"+data.params;
                    }else if(key =="onLoadSuccess"){
                        btObj[key] = data[key];
                    }else{
                        btObj[key] = data[key];
                    }
                }
            }else{
                for(var key in obj){
                    if(key =="url" || key =="params"){
                        btObj.url = obj.url+"?"+obj.params;
                    }else{
                        btObj[key] = obj[key];
                    }
                }

            }
            _this.bootstrapTable('destroy');
            _this.bootstrapTable(btObj);
            obj.created ? obj.created.call(_this[0],_this) : "";
            var width = $(_this[0]).width();
            $(_this[0]).find('thead').find("th").width(width+"px");
        },
    });

    extend(ltable,{
        setting:function(params){
            this.setting.data==undefined ? this.setting.data = {} :"";
            for(var key in params){
                this.setting.data[key] = params[key];
            }
        }
    })
    //创建form
    function createForm(arr, _this) {
        var cbParams = {},sOption;        // 返回的参数
        $(arr).each(function (a, b) {

            var row = $("<div class='row'></div>");
            cbParams.row = row;
            cbParams.form = [];
            //创建一个row并保存
            $(b.list).each(function (c, d) {
                //初始化数据
                var cbObj = {};
                d.placeholder = d.placeholder ? d.placeholder : "";
                d.name = d.name ? d.name : "";
                d.type = d.type ? d.type : "";
                d.value = d.value ? d.value : "";
                d.class = d.class ? d.class : "";
                d.width = d.width ? "width:" + d.width : "";

                cbObj.name = d.name;

                //创建formGroup层
                var formGroup = $("<form-group class='col-md-3 "+d.class+"' style='" + d.width + "'></form-group>");

                //或存在hide 则隐藏整个formGroup
                if (d.hide) {
                    formGroup.css("display", "none");
                }

                //若有title属性则修改宽度并设置title
                var inputWidth = "100%";
                if (d.title) {
                    inputWidth = "75%";
                    // 如果有title 则创建一个label 并使input宽度为75%
                    var label = $("<label class='control-label' style='width: 25%' title=" + d.title + ">" + d.title + ":</label>");
                    formGroup.append(label);
                }

                if (d.type == "select") {
                    //创建下拉select
                    sOption = d.selectOption ? d.selectOption : "";
                    var input = $("<select class='form-control' name='" + d.name + "'></select>");
                    input.append($("<option value=''>" +d.placeholder + "</option>"));
                    if (sOption && sOption.list) {
                        $(sOption.list).each(function (e, f) {
                            f.value = f.value ? f.value : "";
                            input.append($("<option value='" + f.value + "'>" + f.name + "</option>"));
                        })
                    }
                    if (sOption.url && !sOption.list) {
                        var params = urlToString(sOption.params) || "";
                        $.get(sOption.url + "?" + params, function (res) {
                            var name = "";
                            if (isArray(res)&&res!="") {
                                if(type(res[0])){
                                    for (var i = 0; i < res.length; i++) {
                                        if (isArray(sOption.name)) {
                                            name = res[i][sOption.name[0]] + "【" + res[i][sOption.name[1]] + "】"
                                        } else {
                                            name = res[i][sOption.name];
                                        }
                                        input.append($("<option value='" + res[i][sOption.value] + "'>" + name + "</option>"));
                                    }
                                }else{
                                    for (var i = 0; i < res.length; i++) {
                                        input.append($("<option value='"+res[i]+"'>" + res[i] + "</option>"));
                                    }
                                }

                                if(sOption.search==true){
                                    input.chosen({
                                        width: sOption.width ? sOption.width : inputWidth,
                                        disable_search: false,
                                        search_contains: true,
                                        no_results_text: "没有找到",
                                    })
                                }
                            }
                        })
                    }

                    //select互相禁用
                    if (sOption.eachDisabled) {
                        var i = sOption.eachDisabled;
                        if (!isArray(eachDisabled[i])) {
                            eachDisabled[i] = [];
                        }
                        eachDisabled[i].push(input);
                        if (eachDisabled[i].length > 1) {
                            var arr = $(eachDisabled[i]);
                            disabledEach(arr);
                        }
                    }
                } else if (d.type == "time") {
                    //创建时间框（年月日）
                    input = $("<input class='form-control datepicker "+d.class+"' value='"+d.value+"' placeholder='"+d.placeholder+"'>");
                    dataList([input]);
                } else if (d.type == "timeHour") {
                    //创建小时（时分秒）
                    input = $('<div class="input-group clockpicker" data-autoclose="true">\n' +
                        '<input type="text" name="'+d.name+'" value="10:00" class="form-control '+d.class+'">\n' +
                        '</div>')
                    input.clockpicker();
                } else if(d.type == "timeT"){
                    input = timeT(d.name);
                }else {
                    //创建普通input
                    input = $("<input placeholder='" + d.placeholder + "' name='" + d.name + "' type='" + d.type + "' class='form-control' value='" + d.value + "' >");
                }
                input.css("width", inputWidth);
                cbObj = input;
                cbParams.form.push(cbObj);
                formGroup.append(input);
                row.append(formGroup);
                b.created ? b.created.call(input, input) : "";
            })
            _this.append(row);
            //生成成功回调
            b.success ? b.success.call(_this, cbParams) : "";
        });
    }

    //创建按钮
    function createBtn(arr,_this){
        var cbParams = {},sOption,btn;     // 返回的参数
        $(arr).each(function (a, b) {
            b.width = b.width ? b.width :"";
            var formGroup = $("<form-group class='col-md-3 clearfix' style='"+b.width+"'></form-group>");
            $(b.list).each(function(c,d){
                // 初始化数据
                d.color = d.color ? d.color : "btn-info";
                d.name = d.name ? d.name : "";
                d.id = d.id ? d.id : "";
                d.glyphicon = d.glyphicon ? " glyphicon " + d.glyphicon : "";
                d.class = d.class ? d.class : "";
                //创建btn
                btn = $("<button type='button' class='btn "+d.class+" " + d.color + "' id='" + d.id + "'><span class='" + d.glyphicon + "'></span>&nbsp;" + d.name + "</button>");
                formGroup.append(btn);
                d.created ? d.created.call(btn[0],btn):"";
            })
            _this.append(formGroup);
        })
    }
    //extend挂载方法
    function extend(obj1, obj2) {
        for (var key in obj2) {
            if (!obj1.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
    }

    //转换为JQdom
    function turnJqDom(dom) {
        var dom;
        if (dom && dom.length != 0) {
            if (dom instanceof jQuery) {
                dom = dom;
            } else {
                dom = $(dom);
            }
            return dom;
        }
    }

    //select互相禁用
    function disabledEach(jqDom) {
        jqDom.each(function (index) {
            $(this).on("change", function () {
                var i = index == 0 ? 1 : 0;
                if (jqDom[index].value == "" || jqDom[index].value == "0") {
                    $(jqDom[i]).prop('disabled', false).trigger("chosen:updated");
                } else {
                    $(jqDom[i]).prop('disabled', true).trigger("chosen:updated");
                }
            });
        })
    }

    //判断是否为数组
    function isArray(o) {
        return Object.prototype.toString.call(o) == '[object Array]';
    }

    //判断是否为DOM节点
    var isDom = (typeof HTMLElement === 'object') ?
        function (obj) {
            return obj instanceof HTMLElement;
        } :
        function (obj) {
            return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        };


    //url转码(转string)

    function urlToString(url) {
        var result = "";
        if (typeof url == "object") {
            for (var key in url) {
                result += key + "=" + url[key] + "&"
            }
            result = result.slice(0, -1);
            return result;
        } else {
            return url;
        }
    }

    //dataList 日期选择框
    function dataList(params) {
        for (var i = 0; i < params.length; i++) {
            params[i].datepicker({
                format: 'yyyy-mm-dd',
                autoclose: true,
                clearBtn: true,
                todayBtn: 'linked'
            }).on('changeDate', function (e) {
                if (e.date > $('#LTE').datepicker('getDate')) {
                    bi.alert('warning', '', '开始日期不能大于结束日期');
                }
            });
        }
    }
    // 生成timeT
    function timeT(name,width){
        var $dataPicker = $("<div id='datepicker' class='input-daterange input-group col-md-12'></div>");
        var $GET= $('<input  type="text" placeholder="时间区间查询" name='+name[0]+' class="form-control">');
        var $LTE = $('<input type="text" placeholder="时间区间查询" name='+name[1]+' class="form-control">');
        dataList([$GET,$LTE]);
        $dataPicker.append($GET);
        $dataPicker.append($("<span class='input-group-addon'>至</span>"));
        $dataPicker.append($LTE);
        $dataPicker.css("width",width?width:"40%");
        return $dataPicker;
    }

    var types = {
        '[object Function]': 'function',
        '[object Number]': 'number',
        '[object Object]': 'object',
        '[object String]': 'string',
        '[object Undefined]': 'undefined',
        '[object Boolean]': 'boolean',
        '[object Null]': 'null',
        '[object Array]': 'array'
    }

    function type(obj) {
        var str = Object.prototype.toString.call(obj)
        return types[str]
    }

    win.bgt = win.ltable = win.lt = ltable;
    
})(window)