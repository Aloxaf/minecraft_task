        /*登录界面部分*/

/*生成验证码*/
var str1;
var login_createNewCode = function () {
    var arr = ['0','1','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    str1 = "";
    var strlength = 6;
    for(var i = 0; i < strlength; i++)
    {
        var num = Math.floor(Math.random()*arr.length);
        str1+= arr[num];
    };
    var btn = document.getElementById("login_rightcode");
    btn.value = str1;
    var block = document.getElementById("login_yan");
    block.value = "";
}

/*对比验证码，并检验表单正确性*/  /*可改进，现实意义上对用户名及密码进行匹配，并提交表单到数据库*/
function login_validate() {
    var yan = document.getElementById("login_yan");
    var name = document.getElementById("login_name");
    var password = document.getElementById("login_password");
    if(yan.value.toLowerCase() == str1.toLowerCase() && name.value.length != 0 && password.value.length != 0){
        alert("登陆成功");
        document.getElementById("login_form").submit();
        login_formReset();
        window.location.href='http://ow.blizzard.cn/home';
    }
    else if(name.value.length == 0 || password.value.length == 0){
        alert("用户名或密码不得为空");
        login_createNewCode();
    }
    else{
        alert("验证码错误");
        login_createNewCode();
    }
    return false;
}

/*重置表单*/
function login_formReset(){
    document.getElementById("login_form").reset();
}

/*提交登录表单*/
function login_formSubmit(){
    if (login_validate()){
        document.getElementById("login_form").submit();
    }
}



        /*注册界面部分*/
/*生成验证码*/
var str2;
var register_createNewCode = function () {
    var arr = ['0','1','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    str2 = "";
    var strlength = 6;
    for(var i = 0; i < strlength; i++)
    {
        var num = Math.floor(Math.random()*arr.length);
        str2+= arr[num];
    };
    var btn = document.getElementById("register_rightcode");
    btn.value = str2;
    var block = document.getElementById("register_yan");
    block.value = "";
}

/*对比验证码，并检验表单正确性*/  /*可改进，现实意义上对用户名及密码进行匹配，并提交表单到数据库*/
function register_validate() {
    var yan = document.getElementById("register_yan");
    var name = document.getElementById("register_name");
    var password1 = document.getElementById("register_password1");
    var password2 = document.getElementById("register_password2");
    if(yan.value.toLowerCase() == str2.toLowerCase() && name.value.length != 0 && password1.value.length != 0 && password1.value.toLowerCase() == password2.value.toLowerCase()){
        alert("注册成功，返回登录");
/*        document.getElementById("register_form").submit();    */   /*提交会导致页面刷新*/
        document.getElementById('div_register').style.display='none';
        document.getElementById('div_login').style.display='block';
        document.getElementById('fade').style.display='block';
        login_createNewCode();
        login_formReset();      
        register_formReset();
    }
    else if (password1.value.toLowerCase() != password2.value.toLowerCase()){
        alert("两次填写密码不同，请重新填写");
        register_createNewCode();
    }
    else if(name.value.length == 0 || password1.value.length == 0){
        alert("用户名或密码不得为空");
        register_createNewCode();
    }
    else{
        alert("验证码错误");
        register_createNewCode();
    }
    return false;
}

/*重置表单*/
function register_formReset()                {
    document.getElementById("register_form").reset();
}

/*提交登录表单*/
function register_formSubmit(){
    if (register_validate()){
        document.getElementById("register_form").submit();
    }
}