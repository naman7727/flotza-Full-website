

const ResetPasswordPage = () => {
 
  return (
     <div className="bg-white"> 
    <div className="container w-100 h-100 mt-20 m-auto bg-gray-100 p-4 rounded shadow-lg shadow-black-50 ">
      <h3 className="text-3xl text-blue-800 font-bold text-center mb-10">Reset password </h3>
      <input type="text" placeholder="Email or phone" className="block m-auto mt-3  rounded"/>
      <input type="text" placeholder="password" className="block m-auto mt-3 rounded"/>
      <input type="text" placeholder="New password" className="block m-auto mt-3 rounded"/>
      <input type="text" placeholder="Confirm password" className="block m-auto mt-3 rounded"/>
      <button className="bg-blue-600 text-white h-10 w-20 rounded mt-8 ml-35 ">Submit</button>
      </div>
      </div>
  );
};

export default ResetPasswordPage;

