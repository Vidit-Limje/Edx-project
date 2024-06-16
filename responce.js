import express from "express"


const app = express()

// task 1 : 


const axios = require('axios');

// Assuming the JSON data contains an API endpoint URL in a key named 'apiUrl'
const apiUrl = require('./data.json').apiUrl; // Replace with actual path

axios.get(apiUrl)
  .then(response => {
    const data = response.data; // Access the response data as a JavaScript object
    console.log(data); // Process the retrieved data as needed
  })
  .catch(error => {
    console.error('Error fetching data:', error); // Handle potential errors
  });

// task 2 :


const isbn = 1

axios.get(`${apiUrl}/isbn/${isbn}`)
  .then(response => {
    const data = response.data; // Access the response data as a JavaScript object
    console.log(data); // Process the retrieved data as needed
  })
  .catch(error => {
    console.error('Error fetching data:', error); // Handle potential errors
  });
  

// task 3
const authourName = "something"

axios.get(`${apiUrl}/author/${authour}`)
  .then(response => {
    const data = response.data; // Access the response data as a JavaScript object
    console.log(data); // Process the retrieved data as needed
  })
  .catch(error => {
    console.error('Error fetching data:', error); // Handle potential errors
  });


// task 4 

const title = "something went wrong book"


axios.get(`${apiUrl}/title/${title}`)
  .then(response => {
    const data = response.data; // Access the response data as a JavaScript object
    console.log(data); // Process the retrieved data as needed
  })
  .catch(error => {
    console.error('Error fetching data:', error); // Handle potential errors
  });


// task 5


const bookNo = 1


axios.get(`${apiUrl}/review/${bookNo}`)
  .then(response => {
    const data = response.data; // Access the response data as a JavaScript object
    console.log(data); // Process the retrieved data as needed
  })
  .catch(error => {
    console.error('Error fetching data:', error); // Handle potential errors
  });


// task 6

const registerUser = async (req, res) => {
  // req body me se info nikalenge
  // then we have to validate that all fieilds are present or not
  // then we have to search for the current info that the user is present for them

  const { username, fullname, email, password } = req.body;

  if (
    [username, fullname, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const user = await User.findOne({
    $or: [{ fullname }, { email }],
  });

  if (user) {
    throw new ApiError(400, "User already exists");
  }

  const avatarLocalPath = req.file?.path;

  //   console.log(req)

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  const avatar = await uploadOnCloudianary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "avatar cannot uploaded on clodinary");
  }

  const userCreated = await User.create({
    username: username.toLowerCase(),
    fullname,
    avatar: avatar.url,
    email,
    password,
  });

  const userFound = await User.findById(userCreated._id).select(
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(new ApiResponse(201, userFound, "user registered successfully"));
};

app.route("/register", registerUser)

// task 7

const loginUser = (async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email must be required to login");
  }

  if (!password) {
    throw new ApiError(400, "Password is required to login");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { refreshToken, accessToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  // these code is for secure cookies

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "user logged in successfully"));
});

app.route("/login", loginUser)


// task 8

const createBook = (async (req, res) => {

  if(!isAdmin(req.user?._id)){
    throw new ApiError(401, "Only Admins can add new books")
  }
  const { bookname, bookPrice, bookAuthor, bookDescription, bookGenre } =
    req.body;

  if (
    [bookname, bookAuthor, bookDescription, bookGenre].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are necessary");
  }

  if(!bookPrice)
    throw new ApiError(400, "Book Price is required")

  if (
    !(req.files &&
    Array.isArray(req.files.bookImage) &&
    req.files.bookImage.length > 0 &&
    Array.isArray(req.files.bookPdf) &&
    req.files.bookPdf.length > 0)
  ) {
    throw new ApiError(400, "book image and book pdf are required")
  }

  const bookImageLocalPath = req.files.bookImage[0].path
  const bookPdfLocalPath = req.files.bookPdf[0].path

  const bookImage = await uploadOnCloudianary(bookImageLocalPath)
  const bookPdf = await uploadOnCloudianary(bookPdfLocalPath)

  if(!(bookImage && bookPdf)){
    throw new ApiError(400, "book image and book pdf are required")
  }

  const book = await Book.create({
    bookname,
    bookPrice,
    bookAuthor,
    bookDescription,
    bookGenre,
    bookImage : bookImage.url,
    bookPdf : bookPdf.url
  })

  res.status(200).json(new ApiResponse(
    200,
    book,
    "Book was successfully created"
    ))
});

app.route("/create-book", createBook)


// task 11

    app.route("/getAllBooks", async() => {

      const books = await Book.findAll()

      res.json({
        status : 200,
        books,
        message : "book was success fully retrieved"
      })
    })


// task 11

    app.route("/search-by-isbn", async(req, res) => {

      const {isbn} = req.body

      const books = await Book.findAll()

      const requiredbook = books.filter((book) => book.isbn == isbn)

      res.json({
        status : 200,
        data : requiredbook,
        message : "book was success fully retrieved"
      })
    })


//  task 12


    app.route("/search-by-author", async(req, res) => {

      const {author} = req.body

      const book = await Book.findOne({
        author : author 
      })

      res.json({
        status : 200,
        data : book,
        message : "book was success fully retrieved"
      })
    })


//  task 13

    app.route("/search-by-title", async(req, res) => {

      const {title} = req.body

      const book = await Book.findOne({
        title : title 
      })

      res.json({
        status : 200,
        data : book,
        message : "book was success fully retrieved"
      })
    })




