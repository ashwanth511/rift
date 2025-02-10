#[allow(unused_variable, duplicate_alias)]
module rift_token::rift_nft {

  use sui::url;
  use std::string;
  use sui::object;
  use sui::transfer;
  use sui::tx_context;
 
  // A simple NFT that can be minted by anyone
  public struct NFT has key, store {
    // unique id of the NFT
    id: object::UID, 
    // name of the NFT
    name: string::String, 
    // description of the NFT
    description: string::String,
    // url of the NFT image
    url: url::Url,
    // Add any custom attributes here
  }

   // create and mint a new NFT
  public entry fun mint(
    name: vector<u8>, 
    description: vector<u8>, 
    url_bytes: vector<u8>, 
    ctx: &mut tx_context::TxContext
  ) {
    // create the new NFT
    let nft = NFT {
      id: object::new(ctx),
      name: string::utf8(name),
      description: string::utf8(description),
      url: url::new_unsafe_from_bytes(url_bytes),
    };
    // mint and send the NFT to the caller
    transfer::public_transfer(nft, tx_context::sender(ctx));
  }
  // transfer an NFT to another address
  public entry fun transfer(nft: NFT, recipient: address) {
    transfer::public_transfer(nft, recipient);
  }
}