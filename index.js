const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require("path");
const methodoverride = require("method-override");
app.use(methodoverride("_method"));
app.use(express.urlencoded({ extended: true }));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));



// Create the connection to database
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'delta',
	password: "alhanmysql15"
});


const port = 8080;
app.listen(port, () => {
	console.log("Server is running on the port: 8080..");
})


// crating home rout
app.get("/", (req, res) => {

	// writing query to get result from MYSQL
	let query = `SELECT COUNT(*) FROM user`;
	try {
		connection.query(query, (err, result) => {
			if (err) throw err;
			const userCount = result[0]["COUNT(*)"];
			res.render("home.ejs", { userCount });

		});

	} catch (err) {
		// console.log(err);
		res.send(`some error in DB ${err}`);
	}
	// connection.end();
});

// Crating users rout which display all DB into table format using ejs templeting 

// app.get("/user", (req, res) => {
// 	// writing query to get result from MYSQL
	
// 	let query = `SELECT * FROM user`;
// 	try {
// 		connection.query(query, (err, users) => {
// 			if (err) throw err;

// 			res.render("showUsers.ejs", { users });

// 		});

// 	} catch (err) {
// 		// console.log(err);
// 		res.send(`some error in DB ${err}`);
// 	}
// });

app.get('/user', (req, res) => {
    // Query to get all users
    let userQuery = `SELECT * FROM user`;
    
    // Query to count the number of users
    let countQuery = `SELECT COUNT(*) AS userCount FROM user`;
    
    try {
        // First query to get all users
        connection.query(userQuery, (err, users) => {
            if (err) throw err;

            // Second query to count users
            connection.query(countQuery, (err, countResult) => {
                if (err) throw err;

                // Extract the count from the result
                const userCount = countResult[0].userCount;

                // Render the response with both users and count
                res.render('showUsers.ejs', { users, userCount });
            });
        });
    } catch (err) {
        console.log(err);
        res.send(`Some error in DB: ${err}`);
    }
});

// Crating an POST rout rendering signup form;

app.post("/signup",(req,res)=>{
		res.render("signup.ejs");
	});

// Updating new user detils into databse 
const { faker } = require('@faker-js/faker');
let getRandomUser = ()=>  {
	return [
	   faker.internet.password(),
	];
  }

app.post("/user",(req,res)=>{
	    let { name , email , password} = req.body;
		let id = getRandomUser()[0];
		 console.log(id);
		
		let query=(`INSERT INTO user (id , name , email , password ) VALUES (? ,? ,? ,? )`);
		let UserData = [ id, name ,email,password];
		try{ 
			connection.query( query , UserData ,(err,result)=>{
				if(err) throw err;
				console.log(result);
				res.redirect("/user");
			  });
		} catch(err){
			console.log(err);
		}	
});

// Crating edit rout for an perticular id

app.get("/user/:id/edit", (req, res) => {
	let { id: recivedId } = req.params;

	// writing query to get result from MYSQL
	let query = `SELECT * FROM user WHERE id = '${recivedId}' `;
	try {
		connection.query(query, (err, result) => {
			if (err) throw err;
			let user = result[0];
			console.log(user.password);
			res.render("editFrom.ejs", { user });
		});

	} catch (err) {
		// console.log(err);
		res.send(`some error in DB ${err}`);
	}


});


// Crating UPDATE rout 

app.patch("/user/:id", (req, res) => {
	let { password: formPass, name: newName } = req.body;
	let { id: recivedId } = req.params;

	// writing query to get result from MYSQL
	let query = `SELECT * FROM user WHERE id = '${recivedId}' `;
	try {
		connection.query(query, (err, result) => {
			if (err) throw err;
			let user = result[0];
			
			if (formPass != user.password) {   // validation

				res.send("Wrong password!")
			} else {
				let query = (`UPDATE user SET name='${newName}' WHERE id='${recivedId}'`);

				try {
					connection.query(query, (err, result) => {
						if (err) throw err;
						// res.send(result);
						res.redirect("/user")
					});

				} catch (err) {
					// console.log(err);
					res.send(`some error in DB ${err}`);
				}

			}



		});

	} catch (err) {
		// console.log(err);
		res.send(`some error in DB ${err}`);
	}


	
});

// Crating delete rout for an perticular id

app.get("/user/:id/delete",(req,res)=>{
	let { id } = req.params;

	let query=(`DELETE FROM user WHERE id='${id}'`);
	try{ 
		connection.query( query ,(err,result)=>{
			if(err) throw err;
			res.redirect("/user");
		  });
	} catch(err){
		console.log(err);
	}	

});




