var express = require('express');
var router = express.Router();
var User = require('../lib/user');
var db = require('../lib/database');
var tables = require('../lib/tables');
var column = require('../lib/columns');
const user=new User;


router.get('/', function(req, res, next) {
	console.log(req.session.user);
	if(req.session.user){
		res.render('dashboard');
	}
	else{
		res.render('index', { title: 'Welcome to LiteAdmin!!',msg:'Kindly Login or Register a new user' });
	}
	
	
});

router.get('/registerform', function(req, res, next){
	res.render('registerform', { title: 'Welcome to LiteAdmin!!' });
})
router.get('/loginform', function(req, res, next){
	res.render('loginform', { title: 'Welcome to LiteAdmin!!' });
})
router.get('/searchform', function(req, res, next){
	res.render('searchform');
})



router.get('/register',function(req,res){
	res.redirect('/');
})

router.post('/register', function(req, res){
	var password = req.body.password;
	var username=req.body.username;
	var newUser = new User();
	newUser.password = password;	
	newUser.username = username;
	newUser.save(function(err, savedUser){
		if (err){
			console.log(err);
			res.render('registerform',{msg: "This User cannot be registered"});
			return;
		}
		console.log(savedUser);
	
		return res.status(200).render("index", {title: "Registered Successfully"});
    });





});
router.post('/login', function(req, res){
	var password = req.body.password;
	var username=req.body.username;
	User.find({username: username, password: password},(err,user1)=>{
		if(err) console.log(err);
		else{
			req.session.user=user1[0];
			console.log(user1);
			res.render('dashboard');
		}
	})
});
router.get('/showdb',function(req,res){
db.find({username: req.session.user.username},(err,result)=>{
	if(err) console.log(err);
	else{
		res.render('showdb', {result: result});
	}
})
})
router.post('/createdb',function(req,res,next){
	name=req.body.name
	db.find({username: req.session.user.username},(err,result)=>{
		if(err) console.log(err);
		else{
			for(i=0;i<result.length;i++){
				if(result[i].name==name){
					res.render('dashboard',{msg: "This database already exists"});
					return;
				}
			}
			mydb=new db;
			mydb.name=name;
			mydb.username=req.session.user.username;
			mydb.save(function(err,result){
				if(err) console.log(err);
				else{
					console.log(result);
					User.update({username: req.session.user.username},{$addToSet: {"database": result._id}},(err,result)=>{
						if(err) console.log(err);
						else{
							console.log(result);
							res.render('createtable',{db:name});

						}
					})
					
				}
			})
			
		}
	})
})
router.post('/createTable',function(req,res,next){
	mydb=req.body.db;
	console.log(mydb);
	name=req.body.name;
	num=req.body.no_of_col;
	mytable=new tables;
	mytable.username=req.session.user.username;
	mytable.col=num;
	mytable.dbname=mydb;
	mytable.name=name;
	var arr=[]
	for(i=0;i<num;i++){
		arr[i]=i+1;
	}
	mytable.save(function(err,result){
		if(err) console.log(err);
		else{
			console.log(result);
			db.update({username: req.session.user.username, name: mydb},{$addToSet:{"tables": result}},(err,saved)=>{
				if(err) console.log(err);
				else{
					console.log(saved);
					res.render('createCol',{number: arr,table: name, no_of_col: num,db: mydb});
				}
			})
			
		}
	})

})
router.post('/createCol',(req,res,next)=>{
	parenttTable=req.body.table;
	dbname=req.body.db;
	console.log(req.body);
	no_of_col=req.body.no_of_col;
	for(i=0;i<no_of_col;i++){
		console.log(i,"i");
		nameOfCol=req.body[(i+1).toString()+"name"];
		tablename=req.body[(i+1).toString()+"table"];
		colname=req.body[(i+1).toString()+"col"];
		unique=req.body[(i+1).toString()+"checkbox_unique"];
		console.log(nameOfCol, tablename, colname,unique);
		myColumn=new column;
		myColumn.username=req.session.user.username;
		myColumn.tablename=req.body.table;
		myColumn.name=nameOfCol;
		myColumn.dbname=dbname;
		myColumn.length=1;
		myColumn.rows.push(nameOfCol);
		if(unique=="on"){
			myColumn.unique=true;
		}
		else{
			myColumn.unique=false;
		}
		if(tablename.length){
			column.find({tablename: tablename, name: colname}, function(err,column){
				if(err) console.log(err);
				else{
					myColumn.foreignId.push(column[0]._id);
					myColumn.save((err,result)=>{
						if(err) console.log(err);
						else{
							console.log(result);
							
							tables.update({username: req.session.user.username, name: req.body.table},{$addToSet:{"columns": result._id}},(err,result1)=>{
								if(err) console.log(err);
								else{
									console.log(result);
								}
							})
							if(i==no_of_col-1){
								res.render('dashboard',{msg: "Table Created!"});
								return;
							}
						}
					})
				}
			})
		}
		else{
			myColumn.save((err,result)=>{
				if(err) console.log(err);
				else{
					console.log(result);
					console.log("saved column");
					tables.update({username: req.session.user.username, name: req.body.table},{$addToSet:{"columns": result._id}},(err,result1)=>{
						if(err) console.log(err);
						else{
							console.log(result1);
						}
					})
					if(i==no_of_col-1){
						res.render('dashboard',{msg: "Table Created!"});
					}
				}
			})
		}

		
	}
	/*
	'1name': 'id',
  '1table': '',
  '1col': '',
  '1checkbox_unique': 'on',
  '2name': 'names',
  '2table': '',
  '2col': '',
  submit: 'Submit'
  */
  

})
router.get('/showdb',(req,res,next)=>{
	db.find({username: req.session.user.username},(err,result)=>{
		if(err) console.log(err);
		else{
			var arr=[];
			for(i=0;i<result.length;i++){
				arr[i]=result[i]._doc;
			}
			res.render('showdb',{result: arr});
		}
	})
})
router.get('/showtables/:itemid',(req,res,next)=>{
	id=req.params.itemid;
	db.find({username: req.session.user.username},(err,result)=>{
		if(err) console.log(err);
		else{
			//console.log(result._doc.tables);
			for(i=0;i<result.length;i++){
				
				if(result[i]._id==id){
					console.log(id,result[i]._doc.tables);
					tables.find({_id:{$in:result[i]._doc.tables}},(err,result)=>{
						if(err) console.log(err);
						else{
							console.log(result);
							var arr=[];
							for(i=0;i<result.length;i++){
								arr[i]=result[i]._doc;
							}
							
							res.render('showtables',{result: arr});
						}
					})
				}
				
			}
			
		}
	})
})
router.get("/showtablesdata/:id/:dbname",(req,res,next)=>{
	tableid=req.params.id;
	dbname=req.params.dbname;
	tables.findOne({_id: req.params.id,dbname: dbname},(err,result)=>{
		if(err) console.log(err);
		else{
			column.find({username: req.session.user.username, tablename: result.name,dbname: result.dbname},function(err,result1){
				if(err) console.log(err);
				else{
					console.log(result,result1);
					res.render('table',{result: result1});
				}
			})
		}
	})
})
router.post('/addData',(req,res,next)=>{
	dbname=req.body.dbname;
	tablename=req.body.tablename;
	num= req.body.no_of_col;
	var arr1=[];
	for(i=0;i<num;i++){
		arr1[i]=i+1;
	}
	console.log(req.body);
	column.find({dbname: dbname, tablename: tablename, username: req.session.user.username},(err,result)=>{
		var arr=[];
		for(i=0;i<result.length;i++){
			arr[i]=result[i]._doc;
			
		}
		res.render('addData',{db: dbname, table: tablename, num:arr1, result: arr});
	})
	
})
router.post('/add',function(req,res,next){
	dbname= req.body.db;
	tablename=req.body.table;
	no_of_col=req.body.no_of_col;
	
	
	
		 num=req.body.num;
		 console.log(num);
	
	
		column.find({username: req.session.user.username, tablename: tablename, dbname: dbname},(err, result)=>{
			if(err) console.log(err);
			else{
				console.log(result);
				for(j=0;j<result.length;j++){
					for(i=0;i<num;i++){
						console.log("id",(i+1).toString()+ (result[j]._id).toString());
						data=req.body[(i+1).toString()+ (result[j]._id).toString()];
						console.log(data);
						column.update({_id: result[j]._id},{$addToSet:{"rows": data}},(err,result)=>{
							if(err) console.log(err);
							else{
								console.log(result);
								if(j==result.length-1 && i==num-1){
									res.render('dashboard',{msg: "Data Added!"});
									return;
								}
								
							}
						})
					}
					
				}
				
				
			}
		})
		
	
})
router.get("/deletedb/:id",(req,res,next)=>{
	db.find({_id: req.params.id},(err,result)=>{
		if(err) console.log(err);
		else{
			tables.find({username: req.session.user.username,dbname:result[0].name},(err,deleted)=>{
				if(err) console.log(err);
				else{
					for(i=0;i<deleted.length;i++){
						column.remove({username: req.session.user.username, tablename: deleted[i].name,dbname: result[0].name},(err,result)=>{
							if(err) console.log(err);
							else{
								console.log(result);

							}
						})
						tables.deleteOne({_id: deleted[i]._id},(err,result)=>{
							if(err) console.log(err);
							else{
								console.log(result);
							}
						})
					}
				}
			})
			db.deleteOne({_id: req.params.id},(err,result)=>{
				if(err) console.log(err);
				else{
					console.log(result);
					res.render('dashboard', {msg: "Database Deleted!"});
				}
			})
		}
	})
})
module.exports = router;

/*


router.get('/autocomplete',function(req,res,next){
	//console.log(data);
	var regex = new RegExp(req.query["term"],'i');
	var user=User.find({Roll_No: regex}).sort({"updated_at":-1}).sort({"created":-1});
	user.exec(function(err,data){
		//console.log(data);
		var arr=[]
		if(err){
			console.log(err);
		}
		if(data){
			data.forEach(user1 => {
				let obj={
					id: user1._id,
					label: user1.Roll_No+" "+ user1.firstname+" "+user1.lastname
				}
				arr.push(obj);
			});
			var user2=User.find({firstname: regex}).sort({"updated_at":-1}).sort({"created":-1});
			user2.exec(function(err,data1){
				//console.log(data1);
				if(err){
					console.log(err);
				}
				if(data1){
					data1.forEach(user2=>{
						let obj={
							if: user2._id,
							label:user2.Roll_No+" "+ user2.firstname+" "+user2.lastname
						}
						arr.push(obj);
					})
				}
			});
			var user3=User.find({lastname: regex}).sort({"updated_at":-1}).sort({"created":-1});
			user3.exec(function(err,data1){
				//console.log(data1);
				if(err){
					console.log(err);
				}
				if(data1){
					data1.forEach(user3=>{
						let obj={
							if: user3._id,
							label:user3.Roll_No+" "+ user3.firstname+" "+user3.lastname
						}
						arr.push(obj);
					})
					res.jsonp(arr);
				}
			});
			
		}
	})
})






router.post('/register', function(req, res){
	var rollno = req.body.rollno;
	var roll=req.body.rollno;
	//roll=parseInt(roll);
	if(rollno.length!=9){
		
		res.render('registerform',{ msg: "This Roll No. is not 9-digits, put correct roll no."})
	 return;
	}

	
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;

	var newUser = new User();
	newUser.Roll_No = rollno;
	
	newUser.firstname = firstname;
	newUser.lastname = lastname;

	newUser.save(function(err, savedUser){
		if (err){
			console.log(err);
			res.render('registerform',{msg: "This Roll No. cannot be registered"});
		}
		console.log(savedUser);
	
		return res.status(200).render("index", {title: "Registered Successfully"});
    });





});
module.exports = router;
*/
