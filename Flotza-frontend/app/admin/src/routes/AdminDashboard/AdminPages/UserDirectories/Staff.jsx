import React from 'react';

// Helper to generate random staff data
const randomNames = [
  'Rahul Sharma', 'Priya Iyer', 'Mohit Sinha', 'Anjali Mehra', 'Amit Patel',
  'Sneha Rao', 'Vikas Gupta', 'Neha Singh', 'Rohit Verma', 'Pooja Das'
];
const randomDepartments = ['HR', 'Finance', 'Sales', 'IT', 'Operations'];
const randomDesignations = ['Manager', 'Executive', 'Lead', 'Assistant', 'Officer'];
const randomStatus = ['Active', 'Suspended', 'On Leave'];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function generateStaff(count = 10) {
  return Array.from({ length: count }, (_, i) => {
    const name = randomNames[getRandomInt(randomNames.length)];
    const id = `emp${1000 + i}`;
    const email = name.toLowerCase().replace(/ /g, '.') + '@example.com';
    const contact = '9' + Math.floor(100000000 + Math.random() * 900000000);
    const department = randomDepartments[getRandomInt(randomDepartments.length)];
    const designation = randomDesignations[getRandomInt(randomDesignations.length)];
    const status = randomStatus[getRandomInt(randomStatus.length)];
    return { id, name, email, contact, department, designation, status };
  });
}

const staffList = generateStaff(10);

const Staff = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-2xl font-semibold mb-4 text-blue-700">Staff Directory (Mock Data)</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-blue-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Contact</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Designation</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map(staff => (
            <tr key={staff.id} className="even:bg-blue-50">
              <td className="p-2 border">{staff.id}</td>
              <td className="p-2 border">{staff.name}</td>
              <td className="p-2 border">{staff.email}</td>
              <td className="p-2 border">{staff.contact}</td>
              <td className="p-2 border">{staff.department}</td>
              <td className="p-2 border">{staff.designation}</td>
              <td className="p-2 border">{staff.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Staff;
export { staffList };
