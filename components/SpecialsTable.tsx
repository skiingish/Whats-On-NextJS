export default function SpecialsTable() {
  return (
    // Specials Table
        <div className="w-full">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Desc
                </th>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Place
                </th>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  When
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="">
                <td className="px-6 py-4 whitespace-no-wrap">
                  Data 1, Row 1
                </td>
                <td className="px-6 py-4 whitespace-no-wrap">
                  Data 2, Row 1
                </td>
                <td className="px-6 py-4 whitespace-no-wrap">
                  Data 2, Row 1
                </td>
                {/* Add more data cells for this row */}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-no-wrap">
                  Data 1, Row 2
                </td>
                <td className="px-6 py-4 whitespace-no-wrap">
                  Data 2, Row 2
                </td>
                <td className="px-6 py-4 whitespace-no-wrap">
                  Data 2, Row 1
                </td>
                {/* Add more data cells for this row */}
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </div>
  )
}
