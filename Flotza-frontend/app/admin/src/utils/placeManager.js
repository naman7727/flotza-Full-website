export { placeMangeRegister, placeMangerGetSingleSourceData, placeMangerGetSingleAllSourceData, deletePlace, updatePlace };

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:1337';

// ✅ Delete a place by ID
const deletePlace = async function (placeId, token) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");

  try {
    const response = await fetch(`${baseURL}/api/place-manager/place/${placeId}`, {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow'
    });
    const responseData = await response.json();

    if (!response.ok) throw new Error(responseData.message || "Failed to delete place");
    console.log("Place deleted successfully:", responseData);
    return responseData;

  } catch (error) {
    console.error("Delete request failed:", error);
    throw error;
  }
};

// ✅ Register API
const placeMangeRegister = async function (addAddress, token) {
  const requestData = {
    ...addAddress,
    ...(addAddress.address && !addAddress.address_line1 && {
      address_line1: addAddress.address.split(',')[0].trim(),
      address_line2: addAddress.address.split(',').slice(1).join(',').trim()
    })
  };
  delete requestData.address;

  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");

  try {
    const response = await fetch(`${baseURL}/api/place-manager/register`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(requestData),
      redirect: 'follow'
    });
    const responseData = await response.json();

    if (!response.ok) throw new Error(responseData.message || "Failed to register place");
    console.log("Registration success:", responseData);
    return responseData;

  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};

// ✅ Get single source by ID
const placeMangerGetSingleSourceData = async function (sourceId, token) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(`${baseURL}/api/place-manager/singleSource/${sourceId}`, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    });
    const responseData = await response.json();

    if (!response.ok) throw new Error(responseData.message || "Failed to fetch single source data");
    console.log("Single source data retrieved:", responseData);
    return responseData;

  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};

// ✅ Get all sources
const placeMangerGetSingleAllSourceData = async function (token) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(`${baseURL}/api/place-manager/allSource`, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    });
    const responseData = await response.json();

    if (!response.ok) throw new Error(responseData.message || "Failed to fetch all source data");
    console.log("All source data retrieved:", responseData);
    return responseData;

  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};

// ✅ Update place by ID
const updatePlace = async function (placeId, updateData, token) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");

  try {
    const response = await fetch(`${baseURL}/api/place-manager/place/${placeId}`, {
      method: 'PUT',
      headers: myHeaders,
      body: JSON.stringify(updateData),
      redirect: 'follow'
    });
    const responseData = await response.json();

    if (!response.ok) throw new Error(responseData.message || "Failed to update place");
    console.log("Place updated successfully:", responseData);
    return responseData;

  } catch (error) {
    console.error("Update request failed:", error);
    throw error;
  }
};