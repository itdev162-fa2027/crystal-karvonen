using Domain;
using Microsoft.AspNetCore.Mvc;
using Persistence;

namespace API.Controllers;

[ApiController]
[Route("[controller]")] //automatically names the route after the controller name, in this case "Products"
public class ProductsController : ControllerBase
{
    private readonly ILogger<ProductsController> _logger; 
    private readonly DataContext _context;

    public ProductsController(ILogger<ProductsController> logger, DataContext context)
    { //automatically injects database connection so we can talk to SQLite
        _logger = logger;
        _context = context;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Product>> GetProducts()
    {
        var products = _context.Products.ToList(); //grab all products from the database and return them as a list
        return Ok(products); //return 200 OK with the list of products
    }

    [HttpGet("{id}")]
    public ActionResult<Product> GetProduct(int id) 
    {
        var product = _context.Products.Find(id); //find the product in the database by its ID

        if (product == null) 
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public ActionResult<Product> CreateProduct(Product product) //gets the product from the request body and adds it to the database
    {
        // Set audit dates
        product.CreatedDate = DateTime.Now;
        product.LastUpdatedDate = DateTime.Now;

        _context.Products.Add(product);
        var success = _context.SaveChanges() > 0;

        if (success)
        {
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product); //if the product was successfully created, return 201 Created with the product and its ID
        }

        return BadRequest("Failed to create product");
    }

    [HttpPut("{id}")] //gets the product from the request body and updates it in the database
    public ActionResult<Product> UpdateProduct(int id, Product product)
    {

        var existingProduct = _context.Products.Find(id); //look up the product in the database by its ID

        
        if (existingProduct == null)
        {
            return NotFound();
        }

        existingProduct.Name = product.Name; //updating all the properties of the existing product with the new values from the request body
        existingProduct.Description = product.Description;
        existingProduct.Price = product.Price;
        existingProduct.IsOnSale = product.IsOnSale;
        existingProduct.SalePrice = product.SalePrice;
        existingProduct.CurrentStock = product.CurrentStock;
        existingProduct.ImageUrl = product.ImageUrl;

        existingProduct.LastUpdatedDate = DateTime.Now; //setting last updated date to now since we are updating the product

        var success = _context.SaveChanges() > 0;

        if (success)
        {
            return Ok(existingProduct);
        }

        return BadRequest("Failed to update product");
    }

    [HttpDelete("{id}")] //deletes the product from the database by its ID
    public ActionResult DeleteProduct(int id)
    {
        // Find the product we want to delete
        var product = _context.Products.Find(id);

        if (product == null)
        {
            return NotFound();
        }

        _context.Products.Remove(product);
        
        var success = _context.SaveChanges() > 0;

        if (success)
        {
            return NoContent(); 
        }

        return BadRequest("Failed to delete product");
    }
}