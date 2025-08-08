import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";
import { Contact, Trash2 } from "lucide-react";

const ContactsPage = () => {
  const { authorizationToken } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(contacts.length / pageSize);
  const currentContacts = contacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/admin/contacts`, {
        headers: { Authorization: authorizationToken },
      });
      setContacts(res.data.contacts);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  }, [authorizationToken]);

  const deleteContact = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACK_URL}/admin/contact/${id}`, {
        headers: { Authorization: authorizationToken },
      });
      setContacts((prev) => prev.filter((c) => c._id !== id));
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl  text-blue-500 font-bold mb-6 flex items-center gap-2">
        <Contact className="w-10 h-10" />
        Contacts Details
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500">No contact messages found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
            <table className="min-w-full text-sm text-left bg-white">
              <thead className="bg-gray-100 text-gray-700 text-sm font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentContacts.map((c) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{c.phone}</td>
                    <td className="px-4 py-2 max-w-xs truncate">{c.message}</td>
                    <td className="px-4 py-2">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => deleteContact(c._id)}
                        className="text-red-600 hover:text-red-800 transition duration-200"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-md ${currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ContactsPage;
