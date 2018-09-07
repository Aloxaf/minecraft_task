function get()
{
	var content=document.getElementsByTagName("input");
	var sex;
	var flag=0;
	if (content[0].value=='')
	{
		flag=1;
		alert('请填写用户名。');
	}
	else
		if(content[1].value=='')
		{
			flag=1;
			alert('请输入你的密码。');
		}
		else
			if(content[1].value!=content[2].value)
			{
				flag=1;
				alert('两次密码不一致哦。');
			}
	        else
				if(content[3].checked)
					sex=0;
				else
					sex=1;
	if(flag==0)
		if(sex==0)
			alert('欢迎'+content[0].value+'先生，感谢您的浏览与支持。')
		else
			alert('欢迎'+content[0].value+'女士，感谢您的浏览与支持。')
}