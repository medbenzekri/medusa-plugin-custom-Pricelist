import { Table } from "@medusajs/ui";

function ProductTable({ products = [], type, value }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>#</Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {products?.length &&
          products.map((p, i) => {
            return (
              <Table.Row
                key={p.id}
                className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
              >
                <Table.Cell>{i + 1}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center">
                    <div className="my-1.5 mr-4 flex h-[40px] w-[30px] items-center">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          className="rounded-soft h-full object-cover"
                        />
                      ) : null}
                    </div>
                    {p.title}
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
      </Table.Body>
    </Table>
  );
}

export default ProductTable;
